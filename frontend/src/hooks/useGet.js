import { useEffect, useState } from 'react'
import requestJson from './requestJson.js'

function useGet(url, { refreshInterval = 0 } = {}) {
  const [result, setResult] = useState({
    data: null,
    status: null,
    error: null,
    isLoading: false,
  })

  useEffect(() => {
    let active = true
    let timer

    async function loadData() {
      const requestResult = await requestJson(url, { method: 'GET' })
      if (!active) return

      setResult((previous) => {
        if (requestResult.error) {
          return {
            ...previous,
            status: requestResult.status,
            error: requestResult.error,
            isLoading: false,
          }
        }

        const changed = JSON.stringify(previous.data) !== JSON.stringify(requestResult.data)
        if (!changed && previous.error === null && !previous.isLoading) return previous
        return { ...requestResult, isLoading: false }
      })

      if (refreshInterval > 0) {
        timer = setTimeout(loadData, refreshInterval)
      }
    }

    setResult({ data: null, status: null, error: null, isLoading: true })
    loadData()

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [url, refreshInterval])

  return result
}

export default useGet
