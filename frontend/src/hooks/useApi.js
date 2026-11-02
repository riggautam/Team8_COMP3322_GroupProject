import { useCallback, useEffect, useRef, useState } from 'react'

async function requestApi(url, { method, body, signal }) {
  try {
    const response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
    const data = await response.json()
    const error = response.ok
      ? null
      : data?.error || `Request failed with HTTP ${response.status}.`

    return { data, httpCode: response.status, error }
  } catch (requestError) {
    if (requestError instanceof Error && requestError.name === 'AbortError') {
      return { data: null, httpCode: null, error: null }
    }

    const error =
      requestError instanceof Error ? requestError.message : 'The request failed.'
    return { data: null, httpCode: null, error }
  }
}

function useApi(url, { auto = true } = {}) {
  const [result, setResult] = useState({
    url: null,
    data: null,
    error: null,
    httpCode: null,
    isLoading: false,
  })
  const controllerRef = useRef(null)
  const requestIdRef = useRef(0)

  const executeRequest = useCallback(async ({ method = 'POST', body } = {}) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const requestId = ++requestIdRef.current
    setResult({ url, data: null, error: null, httpCode: null, isLoading: true })

    const requestResult = await requestApi(url, {
      method,
      body,
      signal: controller.signal,
    })

    if (requestId === requestIdRef.current) {
      setResult({ url, ...requestResult, isLoading: false })
    }

    return requestResult
  }, [url])

  const sendRequest = useCallback(
    (options) => executeRequest(options),
    [executeRequest],
  )

  useEffect(() => {
    if (auto) {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller
      const requestId = ++requestIdRef.current

      requestApi(url, { method: 'GET', signal: controller.signal }).then((requestResult) => {
        if (requestId === requestIdRef.current && !controller.signal.aborted) {
          setResult({ url, ...requestResult, isLoading: false })
        }
      })
    }

    return () => {
      controllerRef.current?.abort()
      requestIdRef.current += 1
    }
  }, [auto, url])

  const isCurrent = result.url === url
  return {
    data: isCurrent ? result.data : null,
    error: isCurrent ? result.error : null,
    httpCode: isCurrent ? result.httpCode : null,
    isLoading: result.isLoading || (auto && !isCurrent),
    sendRequest,
  }
}

export default useApi
