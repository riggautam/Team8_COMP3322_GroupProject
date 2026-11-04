import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Button from '../../../components/forms/Button.jsx'
import SectionHeading from '../../../components/ui/SectionHeading.jsx'
import requestJson from '../../../hooks/requestJson.js'

const STATUSES = ['pending', 'approved', 'rejected']

function CourseProgress() {
  const [courses, setCourses] = useState([])
  const [hkuCode, setHkuCode] = useState('')
  const [homeCode, setHomeCode] = useState('')
  const [credits, setCredits] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCourses() {
      const result = await requestJson('/api/course-mappings')
      setError(result.error)
      setCourses(result.data?.data ?? [])
      setIsLoading(false)
    }
    loadCourses()
  }, [])

  async function handleAdd(event) {
    event.preventDefault()
    const result = await requestJson('/api/course-mappings', {
      method: 'POST',
      body: { hkuCode, homeCode, credits },
    })
    setError(result.error)
    if (!result.error) {
      setCourses([...courses, result.data.data])
      setHkuCode('')
      setHomeCode('')
      setCredits('')
    }
  }

  async function handleStatus(id, status) {
    const result = await requestJson(`/api/course-mappings/${id}`, {
      method: 'PATCH',
      body: { status },
    })
    setError(result.error)
    if (!result.error) {
      setCourses(courses.map((course) => (course.id === id ? { ...course, status } : course)))
    }
  }

  async function handleRemove(id) {
    const result = await requestJson(`/api/course-mappings/${id}`, { method: 'DELETE' })
    setError(result.error)
    if (!result.error) {
      setCourses(courses.filter((course) => course.id !== id))
    }
  }

  function totalCredits(list) {
    return list.reduce((total, course) => total + course.credits, 0)
  }

  const approved = courses.filter((course) => course.status === 'approved')
  const pending = courses.filter((course) => course.status === 'pending')
  const rejected = courses.filter((course) => course.status === 'rejected')

  return (
    <section className="dash-card" aria-labelledby="courses-title">
      <SectionHeading id="courses-title" icon="book">Course mapping</SectionHeading>

      {isLoading && <p role="status">Loading courses…</p>}
      {error && <p className="status-message status-message--error" role="alert">{error}</p>}

      {!isLoading && courses.length === 0 && (
        <p>No courses mapped yet. Add your first one below.</p>
      )}

      {courses.length > 0 && (
        <>
          <div className="dash-ring-wrap">
            <svg viewBox="0 0 36 36" width="72" height="72" role="img" aria-label={`${approved.length} of ${courses.length} courses approved`}>
              <circle className="dash-ring-track" cx="18" cy="18" r="15.9" pathLength="100" />
              <circle
                className="dash-ring-value"
                cx="18"
                cy="18"
                r="15.9"
                pathLength="100"
                strokeDasharray={`${(approved.length / courses.length) * 100} 100`}
              />
              <text x="18" y="21" textAnchor="middle">{approved.length}/{courses.length}</text>
            </svg>
            <p>
              <strong>{totalCredits(approved)} credits approved</strong><br />
              {totalCredits(pending)} pending · {rejected.length} rejected
            </p>
          </div>
          <ul className="dash-list">
            {courses.map((course) => (
              <li key={course.id} className="dash-row">
                <span>
                  <strong>{course.hkuCode}</strong> → {course.homeCode}
                  <span className="dash-meta dash-credits">{course.credits} credits</span>
                </span>
                <span className="dash-row-actions">
                  <select
                    aria-label={`Status of ${course.hkuCode}`}
                    className={`dash-badge dash-badge-${course.status}`}
                    onChange={(event) => handleStatus(course.id, event.target.value)}
                    value={course.status}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="dash-remove"
                    aria-label={`Remove ${course.hkuCode}`}
                    onClick={() => handleRemove(course.id)}
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <form className="dash-form" onSubmit={handleAdd}>
        <label className="dash-field dash-field-grow">
          HKU code
          <input
            maxLength={30}
            onChange={(event) => setHkuCode(event.target.value)}
            placeholder="COMP3322"
            required
            value={hkuCode}
          />
        </label>
        <label className="dash-field dash-field-grow">
          Home code
          <input
            maxLength={30}
            onChange={(event) => setHomeCode(event.target.value)}
            placeholder="CS3050"
            required
            value={homeCode}
          />
        </label>
        <label className="dash-field dash-field-small">
          Credits
          <input
            max={30}
            min={0.5}
            onChange={(event) => setCredits(event.target.value)}
            placeholder="6"
            required
            step={0.5}
            type="number"
            value={credits}
          />
        </label>
        <Button type="submit" size="small">Add</Button>
      </form>

      <Link to="/transfer-credits">Find matching courses</Link>
    </section>
  )
}

export default CourseProgress