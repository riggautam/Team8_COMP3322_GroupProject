import { useEffect, useRef, useState } from 'react'
import Button from '../../components/forms/Button.jsx'
import LoadingSpinner from '../../components/animation/LoadingSpinner.jsx'
import TextInput from '../../components/forms/TextInput.jsx'
import useApi from '../../hooks/useApi.js'

function CourseUrlSection({ id, label, onFetched }) {
  const [url, setUrl] = useState('')
  const [isWorking, setIsWorking] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const feedbackTimer = useRef(null)
  const { isLoading, sendRequest } = useApi('/api/course-page', { auto: false })

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

    const result = await sendRequest({ body: { url: parsedUrl.href } })
    setIsWorking(false)

    if (result.data?.text) {
      onFetched(result.data.text)
      showFeedback('Course information fetched successfully.', true)
      return
    }

    showFeedback(result.error || 'Failed to fetch the course page.', false)
  }

  return (
    <section className="university-course-input" aria-label={label}>
      <TextInput
        autoComplete="url"
        id={id}
        label={label}
        onChange={setUrl}
        placeholder="https://"
        type="url"
        value={url}
      />
      <div className="university-course-input-action">
        {isWorking || isLoading ? (
          <LoadingSpinner label={`Fetching ${label.toLowerCase()}`} />
        ) : feedback ? (
          <p
            className={`status-message status-message--${feedback.isSuccess ? 'success' : 'error'}`}
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
