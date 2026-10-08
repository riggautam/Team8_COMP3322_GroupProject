import CardHeading from './CardHeading.jsx'

const STATUSES = ['approved', 'pending', 'rejected']

function CourseProgress({ courses }) {
  const counts = Object.fromEntries(
    STATUSES.map((status) => [status, courses.filter((c) => c.status === status).length]),
  )

  return (
    <section className="dash-card" aria-labelledby="courses-title">
      <CardHeading id="courses-title" icon="book">Course mapping</CardHeading>

      {courses.length === 0 ? (
        <p>No courses mapped yet. Start on the Transfer Credits page.</p>
      ) : (
        <>
          <div className="dash-ring-wrap">
            <svg viewBox="0 0 36 36" width="72" height="72" role="img" aria-label={`${counts.approved} of ${courses.length} courses approved`}>
              <circle className="dash-ring-track" cx="18" cy="18" r="15.9" pathLength="100" />
              <circle
                className="dash-ring-value"
                cx="18"
                cy="18"
                r="15.9"
                pathLength="100"
                strokeDasharray={`${(counts.approved / courses.length) * 100} 100`}
              />
              <text x="18" y="21" textAnchor="middle">{counts.approved}/{courses.length}</text>
            </svg>
            <p>
              {counts.approved} approved<br />
              {counts.pending} pending · {counts.rejected} rejected
            </p>
          </div>
          <ul className="dash-list">
            {courses.map((course) => (
              <li key={course.id} className="dash-row">
                <span>
                  <strong>{course.hkuCode}</strong> → {course.homeCode}
                </span>
                <span className={`dash-badge dash-badge-${course.status}`}>{course.status}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <a href="/transfer-credits">Manage transfer credits</a>
    </section>
  )
}

export default CourseProgress
