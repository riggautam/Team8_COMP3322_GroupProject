const STATUSES = ['approved', 'pending', 'rejected']

function CourseProgress({ courses }) {
  const counts = Object.fromEntries(
    STATUSES.map((status) => [status, courses.filter((c) => c.status === status).length]),
  )

  return (
    <section className="dash-card" aria-labelledby="courses-title">
      <h2 id="courses-title">Course mapping</h2>

      {courses.length === 0 ? (
        <p>No courses mapped yet. Start on the Transfer Credits page.</p>
      ) : (
        <>
          <p>
            {counts.approved} of {courses.length} courses approved · {counts.pending} pending ·{' '}
            {counts.rejected} rejected
          </p>
          <progress
            max={courses.length}
            value={counts.approved}
            aria-label="Approved courses"
          />
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
