import { useEffect, useRef, useState } from 'react'
import Button from '../../components/Button.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import useApiRequest from '../../hooks/useApiRequest.js'
import CourseCandidatesSection from './CourseCandidatesSection.jsx'
import CourseDetailsSection from './CourseDetailsSection.jsx'
import CourseUrlSection from './CourseUrlSection.jsx'
import UniversityDropdown from './UniversityDropdown.jsx'
import './TransferCredit.css'

function TransferCredit() {
  const [exchangeUniversity, setExchangeUniversity] = useState('')
  const [homeUniversity, setHomeUniversity] = useState('')
  const [exchangeCourseDetails, setExchangeCourseDetails] = useState('')
  const [matchingData, setMatchingData] = useState(null)
  const [hasAttemptedTransfer, setHasAttemptedTransfer] = useState(false)
  const [transferFeedback, setTransferFeedback] = useState(null)
  const feedbackTimer = useRef(null)
  const transferRequestId = useRef(0)
  const { isLoading, sendRequest } = useApiRequest('/api/matching-courses')

  useEffect(
    () => () => {
      window.clearTimeout(feedbackTimer.current)
    },
    [],
  )

  function showTransferFeedback(message, isSuccess) {
    window.clearTimeout(feedbackTimer.current)
    setTransferFeedback({ message, isSuccess })
    feedbackTimer.current = window.setTimeout(() => {
      setTransferFeedback(null)
    }, 2000)
  }

  function clearCandidateResults() {
    transferRequestId.current += 1
    setMatchingData(null)
    setTransferFeedback(null)
    window.clearTimeout(feedbackTimer.current)
  }

  async function handleTransfer() {
    if (isLoading) return

    setHasAttemptedTransfer(true)
    const transferDetails = {
      'Exchange university': exchangeUniversity,
      'Home university': homeUniversity,
      'Exchange course details': exchangeCourseDetails.trim(),
    }
    const missingFields = Object.entries(transferDetails)
      .filter(([, value]) => !value)
      .map(([label]) => label)

    if (missingFields.length) {
      showTransferFeedback(
        `Please complete: ${missingFields.join(', ')}.`,
        false,
      )
      return
    }

    const requestId = ++transferRequestId.current
    setTransferFeedback(null)
    window.clearTimeout(feedbackTimer.current)
    const result = await sendRequest({
      exchangeUniversity,
      homeUniversity,
      courseDescription: exchangeCourseDetails.trim(),
    })

    if (requestId !== transferRequestId.current) return

    if (result.data && Array.isArray(result.data.candidates)) {
      setMatchingData(result.data)
      showTransferFeedback('AI generated potential course matches.', true)
      return
    }

    showTransferFeedback(
      result.error || 'Could not generate course suggestions.',
      false,
    )
  }

  return (
    <section
      className="university-comparison"
      aria-label="Select exchange and home universities"
    >
      <section className="university-column university-column--exchange">
        <div className="university-primary-row">
          <UniversityDropdown
            kind="exchange"
            title="Exchange university"
            value={exchangeUniversity}
            onChange={(value) => {
              setExchangeUniversity(value)
              clearCandidateResults()
            }}
            invalid={hasAttemptedTransfer && !exchangeUniversity}
          />
        </div>
        <CourseUrlSection
          id="exchange-course-url"
          label="Course description URL"
          onFetched={(value) => {
            setExchangeCourseDetails(value)
            clearCandidateResults()
          }}
        />
        <CourseDetailsSection
          id="exchange-course-details"
          value={exchangeCourseDetails}
          onChange={(value) => {
            setExchangeCourseDetails(value)
            clearCandidateResults()
          }}
          invalid={hasAttemptedTransfer && !exchangeCourseDetails.trim()}
        />
        <div className="university-secondary-space" />
      </section>
      <div className="comparison-middle">
        <svg
          aria-label="Credits transfer from exchange university to home university"
          className="comparison-arrow"
          viewBox="0 0 48 24"
          role="img"
        >
          <path d="M2 12h41m-9-9 9 9-9 9" />
        </svg>
        <div className="comparison-action">
          {isLoading ? (
            <LoadingSpinner label="Finding potential matching courses" />
          ) : transferFeedback ? (
            <p
              className={`status-message status-message--${transferFeedback.isSuccess ? 'success' : 'error'}`}
              role="status"
            >
              {transferFeedback.message}
            </p>
          ) : (
            <Button onClick={handleTransfer} size="large">
              Transfer
            </Button>
          )}
        </div>
      </div>
      <section className="university-column university-column--home">
        <div className="university-primary-row">
          <UniversityDropdown
            kind="home"
            title="Home university"
            value={homeUniversity}
            onChange={(value) => {
              setHomeUniversity(value)
              clearCandidateResults()
            }}
            invalid={hasAttemptedTransfer && !homeUniversity}
          />
        </div>
        <CourseCandidatesSection matchingData={matchingData} />
        <div className="university-secondary-space" />
      </section>
    </section>
  )
}

export default TransferCredit
