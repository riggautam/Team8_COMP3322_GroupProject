import { Link } from 'react-router'

const STATUSES = ['pending', 'approved', 'rejected']

// Adds up the credits of the given courses.
function totalCredits(courses) {
  return courses.reduce((total, course) => total + course.credits, 0)
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

  const { courses, error, isLoading, updateCourseStatus, removeCourse } = plan
  const approved = courses.filter((course) => course.status === 'approved')
  const pending = courses.filter((course) => course.status === 'pending')

  function handleRemove(course) {
    if (!window.confirm(`Remove ${course.hkuCode} → ${course.homeCode} from your plan?`)) return
    removeCourse(course.id)
  }

  return (
    <>
      {error && (
        <p className="status-message status-message--error plan-error" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="plan-note" role="status">Loading your plan…</p>
      ) : courses.length === 0 ? (
        <p className="plan-note">No courses yet. Use Send to plan on a suggested match above.</p>
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
    </>
  )
}

export default StudyPlanTable