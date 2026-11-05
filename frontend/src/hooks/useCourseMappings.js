import { useEffect, useState } from 'react'
import requestJson from './requestJson.js'

function useCourseMappings() {
  const [courses, setCourses] = useState([])
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

  async function addCourse(course) {
    const result = await requestJson('/api/course-mappings', {
      method: 'POST',
      body: course,
    })
    setError(result.error)
    if (result.error) return false

    setCourses((currentCourses) => [...currentCourses, result.data.data])
    return true
  }

  async function updateCourseStatus(id, status) {
    const result = await requestJson(`/api/course-mappings/${id}`, {
      method: 'PATCH',
      body: { status },
    })
    setError(result.error)
    if (result.error) return

    setCourses((currentCourses) => currentCourses.map((course) => (
      course.id === id ? { ...course, status } : course
    )))
  }

  async function removeCourse(id) {
    const result = await requestJson(`/api/course-mappings/${id}`, { method: 'DELETE' })
    setError(result.error)
    if (result.error) return

    setCourses((currentCourses) => currentCourses.filter((course) => course.id !== id))
  }

  return { courses, error, isLoading, addCourse, updateCourseStatus, removeCourse }
}

export default useCourseMappings
