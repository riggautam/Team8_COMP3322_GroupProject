import { useState } from 'react'
import { Link } from 'react-router'
import Button from '../../components/forms/Button.jsx'

const STATUSES = ['pending', 'approved', 'rejected']
const DEFAULT_CREDITS = 6 // a standard HKU course

// Adds up the credits of the given courses.
function totalCredits(courses) {
  return courses.reduce((total, course) => total + course.credits, 0)
}

// For courses the AI didn't suggest, e.g. ones the home university already approved.
// The server checks everything again: codes, credits, the link and duplicates.
function AddCourseForm({ onAdd }) {
  const [hkuCode, setHkuCode] = useState('')
  const [homeCode, setHomeCode] = useState('')
  const [homeUrl, setHomeUrl] = useState('')
  const [credits, setCredits] = useState(DEFAULT_CREDITS)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser's own form submit (a page reload)
    setIsSaving(true)
    const added = await onAdd({ hkuCode, homeCode, homeUrl, credits })
    setIsSaving(false)

    // Only clear the form if it worked, so a mistake can be fixed without retyping.
    if (added) {
      setHkuCode('')
      setHomeCode('')
      setHomeUrl('')
      setCredits(DEFAULT_CREDITS)
    }
  }

  return (
    <form className="plan-form" onSubmit={handleSubmit}>
      <h3 className="plan-form-title">Add a course yourself</h3>
      <div className="plan-form-fields">
        <label className="plan-field">
          HKU code
          <input
            maxLength={30}
            onChange={(event) => setHkuCode(event.target.value)}
            placeholder="COMP3322"
            required
            value={hkuCode}
          />
        </label>
        <label className="plan-field">
          Home code
          <input
            maxLength={30}
            onChange={(event) => setHomeCode(event.target.value)}
            placeholder="COMP6080"
            required
            value={homeCode}
          />
        </label>
        <label className="plan-field plan-field--wide">
          Home course link (optional)
          <input
            maxLength={2048}
            onChange={(event) => setHomeUrl(event.target.value)}
            placeholder="https://"
            type="url"
            value={homeUrl}
          />
        </label>
        <label className="plan-field plan-field--small">
          Credits
          <input
            max={30}
            min={0.5}
            onChange={(event) => setCredits(event.target.value)}
            required
            step={0.5}
            type="number"
            value={credits}
          />
        </label>
        <Button type="submit" size="small" disabled={isSaving}>
          {isSaving ? 'Adding…' : 'Add'}
        </Button>
      </div>
    </form>
  )
}

// The student's saved course pairs. plan comes from useCourseMappings, the same one
// Send to plan uses, so new courses show up here straight away.
function StudyPlanTable({ plan, isLoggedIn }) {
  if (!isLoggedIn) {
    return (
      <p className="plan-note">
        <Link to="/login">Log in</Link> to keep a study plan of the courses you match.
      </p>
    )
  }

  const { courses, error, isLoading, addCourse, updateCourseStatus, removeCourse } = plan
  const approved = courses.filter((course) => course.status === 'approved')
  const pending = courses.filter((course) => course.status === 'pending')

  function handleRemove(course) {
    if (!window.confirm(`Remove ${course.hkuCode} → ${course.homeCode} from your plan?`)) return
    removeCourse(course.id)
  }

  return (
    <>
      {isLoading ? (
        <p className="plan-note" role="status">Loading your plan…</p>
      ) : courses.length === 0 ? (
        <p className="plan-note">
          No courses yet. Use Send to plan on a suggested match above, or add one below.
        </p>
      ) : (
        <>
          <p className="plan-totals">
            <strong>{totalCredits(approved)} credits approved</strong>
            {' · '}
            {totalCredits(pending)} pending · {courses.length} {courses.length === 1 ? 'course' : 'courses'} in total
          </p>

          {/* Wide tables scroll inside this box on phones instead of the whole page. */}
          <div className="plan-table-wrap">
            <table className="plan-table">
              <thead>
                <tr>
                  <th scope="col">HKU course</th>
                  <th scope="col">Home course</th>
                  <th scope="col">Credits</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="plan-sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.hkuCode}</td>
                    <td>
                      {course.homeUrl ? (
                        <a href={course.homeUrl} rel="noreferrer" target="_blank">
                          {course.homeCode} ↗
                        </a>
                      ) : (
                        course.homeCode
                      )}
                    </td>
                    <td>{course.credits}</td>
                    <td>
                      <select
                        aria-label={`Status of ${course.hkuCode} → ${course.homeCode}`}
                        className={`plan-status plan-status--${course.status}`}
                        onChange={(event) => updateCourseStatus(course.id, event.target.value)}
                        value={course.status}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="plan-remove"
                        aria-label={`Remove ${course.hkuCode} → ${course.homeCode}`}
                        onClick={() => handleRemove(course)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="plan-note">
            Only approved courses count towards your transferable credits. Home course links
            from AI suggestions are unverified.
          </p>
        </>
      )}

      {error && (
        <p className="status-message status-message--error plan-error" role="alert">
          {error}
        </p>
      )}

      <AddCourseForm onAdd={addCourse} />
    </>
  )
}

export default StudyPlanTable