import { useEffect, useState } from 'react'
import requestJson from './requestJson.js'

function useGet(url) {
  const [result, setResult] = useState({
    data: null,
    status: null,
    error: null,
    isLoading: false,
  })

  useEffect(() => {
    async function loadData() {
      const requestResult = await requestJson(url, { 
        method: 'GET' 
      })
      setResult({ ...requestResult, isLoading: false })
    }

    // reset data
    setResult({ data: null, status: null, error: null, isLoading: true })
    loadData()
  }, [url])

  return result
}

export default useGet
