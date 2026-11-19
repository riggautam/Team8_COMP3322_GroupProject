import { useRef, useState } from 'react'
import hkuIcon from '../../assets/HKU.webp'
import Button from '../../components/forms/Button.jsx'
import TextInput from '../../components/forms/TextInput.jsx'
import PageBanner from '../../components/layout/PageBanner.jsx'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'
import SectionHeading from '../../components/ui/SectionHeading.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import useCourseMappings from '../../hooks/useCourseMappings.js'
import usePost from '../../hooks/usePost.js'
import CourseCandidatesSection from './CourseCandidatesSection.jsx'
import CourseDetailsSection from './CourseDetailsSection.jsx'
import CourseUrlSection from './CourseUrlSection.jsx'
import StudyPlanTable from './StudyPlanTable.jsx'
import UniversityDropdown from './UniversityDropdown.jsx'
import './TransferCredit.css'

const HKU_TO_HOME = 'hku-to-home' // enter an HKU course, get home courses
const HOME_TO_HKU = 'home-to-hku' // enter a home course, get HKU courses

// HKU is always one side, so it's a fixed badge instead of a dropdown.
function HkuBadge({ title }) {
  return (
    <div>
      <h3 className="university-select-label">{title}</h3>
      <div className="hku-badge">
        <span className="university-image">
          <img src={hkuIcon} alt="" />
        </span>
        The University of Hong Kong (HKU)
      </div>
    </div>
  )
}

function TransferCredit() {
  const { user } = useAuth()
  const plan = useCourseMappings()
  const [direction, setDirection] = useState(HKU_TO_HOME)
  const [homeUniversity, setHomeUniversity] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [courseDetails, setCourseDetails] = useState('')
  const [courseUrl, setCourseUrl] = useState('') // the page the details were fetched from
  const [matchingData, setMatchingData] = useState(null)
  const [formError, setFormError] = useState(null)
  const [hasAttempted, setHasAttempted] = useState(false)
  // Goes up with every new request, so a slow old answer can't replace a newer one.
  const requestId = useRef(0)
  const { isLoading, post } = usePost('/api/matching-courses')

  const isHkuToHome = direction === HKU_TO_HOME

  // Results belong to the inputs they came from, so any change throws them away.
  function clearResults() {
    requestId.current += 1
    setMatchingData(null)
    setFormError(null)
  }

  function flipDirection() {
    setDirection(isHkuToHome ? HOME_TO_HKU : HKU_TO_HOME)
    clearResults()
  }

  async function handleFindMatches() {
    setHasAttempted(true)
    const missing = [
      !homeUniversity && 'home university',
      !courseCode.trim() && 'course code',
      !courseDetails.trim() && 'course details',
    ].filter(Boolean)
    if (missing.length) {
      setFormError(`Please add the ${missing.join(', ')}.`)
      return
    }

    const thisRequest = ++requestId.current
    setFormError(null)
    setMatchingData(null)
    const result = await post({
      direction,
      homeUniversity,
      courseCode,
      courseDescription: courseDetails,
    })
    if (thisRequest !== requestId.current) return // the inputs changed while we waited

    if (Array.isArray(result.data?.data?.candidates)) {
      // Keep the fetched link with the result: in Home → HKU it's the home course's page.
      setMatchingData({ ...result.data.data, sourceUrl: courseUrl })
    } else {
      setFormError(result.error || 'Could not find matching courses.')
    }
  }

  // Works out which code is HKU's and which is the home university's. It uses the direction
  // stored in the result, so flipping the toggle afterwards can't mix them up.
  function pairFor(candidate) {
    const code = candidate.courseCode.trim().toUpperCase()
    if (!code) return null

    const sourceIsHku = matchingData.direction === HKU_TO_HOME
    return {
      hkuCode: sourceIsHku ? matchingData.sourceCourseCode : code,
      homeCode: sourceIsHku ? code : matchingData.sourceCourseCode,
      homeUrl: (sourceIsHku ? candidate.courseUrl : matchingData.sourceUrl) || null,
    }
  }

  function isInPlan(pair) {
    return plan.courses.some(
      (course) => course.hkuCode === pair.hkuCode && course.homeCode === pair.homeCode,
    )
  }

  function savePair(pair, credits) {
    return plan.addCourse({ ...pair, credits })
  }

  const homeSide = (
    <div>
      <UniversityDropdown
        kind="home"
        title={isHkuToHome ? 'To' : 'From'}
        value={homeUniversity}
        onChange={(value) => {
          setHomeUniversity(value)
          clearResults()
        }}
        invalid={hasAttempted && !homeUniversity}
      />
    </div>
  )

  return (
    <div className="transfer-credit-page">
      <PageBanner
        title="Course transfer planner"
        description="Find courses that could transfer between HKU and your home university, then save them to your study plan."
      />

      <section className="tc-card" aria-labelledby="tc-match-title">
        <SectionHeading id="tc-match-title" icon="book">Find matching courses</SectionHeading>
        <p className="tc-hint">
          {isHkuToHome
            ? 'Enter an HKU course to see which home courses it could count as.'
            : 'Enter a home course to find HKU courses you could take instead.'}
        </p>

        <div className="tc-universities">
          {isHkuToHome ? <HkuBadge title="From" /> : homeSide}
          <Button
            variant="custom"
            type="button"
            className="tc-flip"
            onClick={flipDirection}
            aria-label={
              isHkuToHome
                ? 'Flip: match a home course to HKU instead'
                : 'Flip: match an HKU course to your home university instead'
            }
          >
            <svg viewBox="0 0 48 24" aria-hidden="true">
              <path d="M2 12h41m-9-9 9 9-9 9" />
            </svg>
            Flip
          </Button>
          {isHkuToHome ? homeSide : <HkuBadge title="To" />}
        </div>

        <div className="tc-course">
          <TextInput
            id="tc-course-code"
            label={isHkuToHome ? 'HKU course code' : 'Home course code'}
            onChange={(value) => {
              setCourseCode(value)
              clearResults()
            }}
            placeholder={isHkuToHome ? 'e.g. COMP3322' : 'e.g. COMP6080'}
            value={courseCode}
          />
          <CourseUrlSection
            id="tc-course-url"
            label="Course page link"
            onFetched={(text, url) => {
              setCourseDetails(text)
              setCourseUrl(url)
              clearResults()
            }}
          />
          <CourseDetailsSection
            id="tc-course-details"
            value={courseDetails}
            onChange={(value) => {
              setCourseDetails(value)
              clearResults()
            }}
            invalid={hasAttempted && !courseDetails.trim()}
          />
        </div>

        <div className="tc-actions">
          <Button size="large" onClick={handleFindMatches} disabled={isLoading}>
            Find matches
          </Button>
          {isLoading && <LoadingSpinner label="Finding matching courses" />}
          {formError && (
            <p className="status-message status-message--error" role="alert">
              {formError}
            </p>
          )}
        </div>
      </section>

      {matchingData && (
        <section className="tc-card" aria-labelledby="tc-results-title">
          <SectionHeading id="tc-results-title" icon="link">Suggested matches</SectionHeading>
          <CourseCandidatesSection
            matchingData={matchingData}
            getPair={pairFor}
            canSave={Boolean(user)}
            isInPlan={isInPlan}
            onSave={savePair}
            saveError={plan.error}
          />
        </section>
      )}

      <section className="tc-card" aria-labelledby="tc-plan-title">
        <SectionHeading id="tc-plan-title" icon="check">My study plan</SectionHeading>
        <StudyPlanTable plan={plan} isLoggedIn={Boolean(user)} />
      </section>
    </div>
  )
}

export default TransferCredit