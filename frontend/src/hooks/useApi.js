import { useEffect, useState } from 'react'

function useApi(url) {
  const [result, setResult] = useState({ url: null, data: null, error: null })

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error(`Request failed (${response.status})`)
        setResult({ url, data: await response.json(), error: null })
      } catch (error) {
        if (error.name === 'AbortError') return
        setResult({ url, data: null, error: error.message })
      }
    }

    load()
    return () => controller.abort()
  }, [url])

  const isCurrent = result.url === url
  return {
    data: result.data,
    error: isCurrent ? result.error : null,
    isLoading: !isCurrent,
  }
}

export default useApi
