const dns = require('node:dns').promises;
const http = require('node:http');
const https = require('node:https');
const net = require('node:net');

const MAX_PAGE_BYTES = 1_000_000;
const MAX_REDIRECTS = 3;
const REQUEST_TIMEOUT_MS = 10_000;

function isPublicAddress(address) {
  const version = net.isIP(address);
  if (version === 4) {
    const octets = address.split('.').map(Number);
    const [first, second] = octets;
    return !(
      first === 0 ||
      first === 10 ||
      first === 127 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      (first === 192 && second === 0) ||
      (first === 192 && second === 2) ||
      (first === 192 && second === 88 && octets[2] === 99) ||
      (first === 198 && (second === 18 || second === 19)) ||
      (first === 198 && second === 51 && octets[2] === 100) ||
      (first === 203 && second === 0 && octets[2] === 113) ||
      first >= 224
    );
  }

  if (version !== 6) return false;

  const normalized = address.toLowerCase();
  return (
    (normalized.startsWith('2') || normalized.startsWith('3')) &&
    !normalized.startsWith('2001:0:') &&
    !normalized.startsWith('2001:2:') &&
    !normalized.startsWith('2001:db8:') &&
    !normalized.startsWith('2001:10:') &&
    !normalized.startsWith('2002:')
  );
}

function validateUrl(value) {
  let url;

  try {
    url = new URL(value);
  } catch {
    const error = new Error('Enter a valid course description link.');
    error.statusCode = 400;
    throw error;
  }

  if (
    !['http:', 'https:'].includes(url.protocol) ||
    !url.hostname ||
    url.username ||
    url.password ||
    (url.protocol === 'http:' && url.port && url.port !== '80') ||
    (url.protocol === 'https:' && url.port && url.port !== '443')
  ) {
    const error = new Error(
      'Use a public HTTP or HTTPS link on the standard web port.',
    );
    error.statusCode = 400;
    throw error;
  }

  return url;
}

async function getPublicAddresses(hostname) {
  const literalAddress = hostname.replace(/^\[|\]$/g, '');
  const literalFamily = net.isIP(literalAddress);
  const addresses = literalFamily
    ? [{ address: literalAddress, family: literalFamily }]
    : await dns.lookup(hostname, { all: true, verbatim: true });

  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
    const error = new Error('The link must resolve to a public address.');
    error.statusCode = 400;
    throw error;
  }

  return addresses;
}

function readResponse(response) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    response.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_PAGE_BYTES) {
        const error = new Error('The linked page is too large to fetch.');
        error.statusCode = 413;
        response.destroy(error);
        return;
      }
      chunks.push(chunk);
    });

    response.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    response.on('error', reject);
  });
}

function makeRequest(url, addresses) {
  const transport = url.protocol === 'https:' ? https : http;
  const address = addresses[0];

  return new Promise((resolve, reject) => {
    const request = transport.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        headers: {
          Accept: 'text/html,application/xhtml+xml,text/plain,application/json',
          'User-Agent': 'WEST course information fetcher',
        },
        lookup: (_hostname, options, callback) => {
          const result = { address: address.address, family: address.family };
          if (options?.all) callback(null, [result]);
          else callback(null, result.address, result.family);
        },
      },
      async (response) => {
        const statusCode = response.statusCode || 502;
        const contentType = response.headers['content-type'] || '';

        if (statusCode >= 300 && statusCode < 400) {
          response.resume();
          resolve({
            statusCode,
            location: response.headers.location,
            contentType,
          });
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          response.resume();
          resolve({ statusCode, contentType });
          return;
        }

        try {
          const text = await readResponse(response);
          resolve({ statusCode, contentType, text });
        } catch (error) {
          reject(error);
        }
      },
    );

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      const error = new Error('The linked page took too long to respond.');
      error.statusCode = 504;
      request.destroy(error);
    });
    request.on('error', reject);
    request.end();
  });
}

function extractPageText(body, contentType) {
  if (!/html|text\/plain|application\/json/i.test(contentType)) {
    const error = new Error('The linked page is not HTML, plain text, or JSON.');
    error.statusCode = 415;
    throw error;
  }

  let text = body;
  if (/html/i.test(contentType)) {
    text = text
      .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<br\b[^>]*>/gi, '\n')
      .replace(/<\/(td|th)\s*>/gi, '\t')
      .replace(
        /<\/(p|div|li|h[1-6]|tr|table|section|article|header|footer|blockquote)\s*>/gi,
        '\n',
      )
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&#(\d+);/g, (_, code) =>
        String.fromCodePoint(Number(code)),
      )
      .replace(/&#x([\da-f]+);/gi, (_, code) =>
        String.fromCodePoint(Number.parseInt(code, 16)),
      );
  }

  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => {
      const cells = line
        .split('\t')
        .map((cell) => cell.replace(/[ \f\v]+/g, ' ').trim());
      while (cells.length && !cells[0]) cells.shift();
      while (cells.length && !cells[cells.length - 1]) cells.pop();
      return cells.join('\t');
    })
    .join('\n')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
}

async function fetchCoursePage(inputUrl, redirects = 0) {
  const url = validateUrl(inputUrl);
  const addresses = await getPublicAddresses(url.hostname);
  const result = await makeRequest(url, addresses);

  if (result.statusCode >= 300 && result.statusCode < 400) {
    if (!result.location || redirects >= MAX_REDIRECTS) {
      const error = new Error('The linked page redirected too many times.');
      error.statusCode = 502;
      throw error;
    }

    const nextUrl = new URL(result.location, url);
    return fetchCoursePage(nextUrl.href, redirects + 1);
  }

  if (result.statusCode < 200 || result.statusCode >= 300) {
    const error = new Error(`The linked page returned HTTP ${result.statusCode}.`);
    error.statusCode = 502;
    throw error;
  }

  const text = extractPageText(result.text, result.contentType);
  if (!text) {
    const error = new Error('No readable course page text was found at that link.');
    error.statusCode = 422;
    throw error;
  }

  return text;
}

module.exports = { fetchCoursePage };
