async function requestJson(url, { method, body } = {}) {
  try {
    const response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    // Some responses have no JSON body, such as 204 or a crashed backend.
    const text = await response.text()
    let data = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    // Show people the server's own message (e.g. "That email is already registered.").
    // The status code is still returned separately for code that needs it.
    const error = response.ok
      ? null
      : data?.error || `Something went wrong (${response.status} ${response.statusText}). Please try again.`

    return { data, status: response.status, error }
  } catch {
    // fetch itself failed: no connection, or the server is down.
    return { data: null, status: null, error: 'Could not reach WEST. Check your connection and try again.' }
  }
}

export default requestJson