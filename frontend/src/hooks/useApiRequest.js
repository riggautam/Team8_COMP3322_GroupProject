import { useCallback, useState } from 'react'

function useApiRequest(endpoint) {
  const [data, setData] = useState(null)
  const [httpCode, setHttpCode] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const sendRequest = useCallback(
    async (body) => {
      setIsLoading(true)
      setError(null)
      setData(null)
      setHttpCode(null)

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const result = await response.json()

        const responseData = result.text ?? result.data ?? null
        setData(responseData)
        setHttpCode(response.status)
        if (!response.ok) {
          setError(result.error || `Request failed with HTTP ${response.status}.`)
        }

        return {
          data: responseData,
          httpCode: response.status,
          error: result.error || null,
        }
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'The request failed.'
        setError(message)
        return { data: null, httpCode: null, error: message }
      } finally {
        setIsLoading(false)
      }
    },
    [endpoint],
  )

  return { data, httpCode, error, isLoading, sendRequest }
}

export default useApiRequest
