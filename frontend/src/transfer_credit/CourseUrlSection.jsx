import { useEffect, useRef, useState } from 'react'
import Button from '../global/Button.jsx'
import LoadingSpinner from '../global/LoadingSpinner.jsx'
import UrlInput from '../global/UrlInput.jsx'
import useApiRequest from '../hooks/useApiRequest.js'

function CourseUrlSection({ id, label, onFetched }) {
  const [url, setUrl] = useState('')
  const [isWorking, setIsWorking] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const feedbackTimer = useRef(null)
  const { isLoading, sendRequest } = useApiRequest('/api/course-page')

  useEffect(
    () => () => {
      window.clearTimeout(feedbackTimer.current)
    },
    [],
  )

  function showFeedback(message, isSuccess) {
    setFeedback({ message, isSuccess })
    feedbackTimer.current = window.setTimeout(() => {
      setFeedback(null)
    }, 2000)
  }

  async function fetchCourse() {
    setFeedback(null)
    setIsWorking(true)
    onFetched('')
    await new Promise((resolve) => window.setTimeout(resolve, 0))

    let parsedUrl
    try {
      parsedUrl = new URL(url.trim())
    } catch {
      setIsWorking(false)
      showFeedback('Enter a valid course description link.', false)
      return
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      setIsWorking(false)
      showFeedback('Use a valid HTTP or HTTPS course link.', false)
      return
    }

    const result = await sendRequest({ url: parsedUrl.href })
    setIsWorking(false)

    if (result.data) {
      onFetched(result.data)
      showFeedback('Course information fetched successfully.', true)
      return
    }

    showFeedback(result.error || 'Failed to fetch the course page.', false)
  }

  return (
    <section className="university-course-input" aria-label={label}>
      <UrlInput
        id={id}
        label={label}
        onChange={setUrl}
        value={url}
      />
      <div className="university-course-input-action">
        {isWorking || isLoading ? (
          <LoadingSpinner label={`Fetching ${label.toLowerCase()}`} />
        ) : feedback ? (
          <p
            className={`course-fetch-feedback${feedback.isSuccess ? ' course-fetch-feedback--success' : ' course-fetch-feedback--error'}`}
            role="status"
          >
            {feedback.message}
          </p>
        ) : (
          <Button onClick={fetchCourse} size="small">
            Fetch course
          </Button>
        )}
      </div>
    </section>
  )
}

export default CourseUrlSection
