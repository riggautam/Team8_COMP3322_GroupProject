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

    const error = response.ok
      ? null
      : `${response.status} ${response.statusText}: ${data?.error || 'Request failed.'}`

    return { data, status: response.status, error }
  } catch (error) {
    return { data: null, status: null, error: error.message }
  }
}

export default requestJson