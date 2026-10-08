import { useState } from 'react'
import Button from '../global/Button.jsx'
import LoadingSpinner from '../global/LoadingSpinner.jsx'
import CourseDetailsSection from './CourseDetailsSection.jsx'
import CourseUrlSection from './CourseUrlSection.jsx'
import UniversityDropdown from './UniversityDropdown.jsx'
import './TransferCredit.css'

function TransferCredit() {
  const [exchangeUniversity, setExchangeUniversity] = useState('')
  const [homeUniversity, setHomeUniversity] = useState('')
  const [exchangeCourseDetails, setExchangeCourseDetails] = useState('')
  const [homeCourseDetails, setHomeCourseDetails] = useState('')
  const [isSearching, setIsSearching] = useState(false)

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
            onChange={setExchangeUniversity}
          />
        </div>
        <CourseUrlSection
          id="exchange-course-url"
          label="Course description URL"
          onFetched={setExchangeCourseDetails}
        />
        <CourseDetailsSection
          id="exchange-course-details"
          value={exchangeCourseDetails}
          onChange={setExchangeCourseDetails}
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
          {isSearching ? (
            <LoadingSpinner label="Searching home university courses" />
          ) : (
            <Button onClick={() => setIsSearching(true)} size="large">
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
            onChange={setHomeUniversity}
          />
        </div>
        <CourseUrlSection
          id="home-course-url"
          label="Course description URL"
          onFetched={setHomeCourseDetails}
        />
        <CourseDetailsSection
          id="home-course-details"
          value={homeCourseDetails}
          onChange={setHomeCourseDetails}
        />
        <div className="university-secondary-space" />
      </section>
    </section>
  )
}

export default TransferCredit
