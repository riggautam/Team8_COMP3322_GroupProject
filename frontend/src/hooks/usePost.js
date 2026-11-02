import { useState } from 'react'
import requestJson from './requestJson.js'

function usePost(url) {
  const [result, setResult] = useState({
    data: null,
    status: null,
    error: null,
    isLoading: false,
  })

  async function post(body) {
    // reset data
    setResult({ data: null, status: null, error: null, isLoading: true })

    const requestResult = await requestJson(url, {
      method: 'POST',
      body
    })

    setResult({ ...requestResult, isLoading: false })

    return requestResult
  }

  return {
    ...result,
    post,
  }
}

export default usePost
