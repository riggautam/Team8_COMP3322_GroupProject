import { useState } from 'react'
import Checklist from '../../components/cards/Checklist.jsx'
import CourseProgress from '../../components/cards/CourseProgress.jsx'
import EventsSection from '../../components/cards/EventsSection.jsx'
import FoodSpots from '../../components/cards/FoodSpots.jsx'
import LatestPosts from '../../components/cards/LatestPosts.jsx'
import QuickLinks from '../../components/navigation/QuickLinks.jsx'
import WelcomeHeader from '../../components/layout/WelcomeHeader.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import useChecklist from '../../hooks/useChecklist.js'
import useCourseMappings from '../../hooks/useCourseMappings.js'
import useGet from '../../hooks/useGet.js'
import './Dashboard.css'

const QUICK_LINKS = [
  { icon: 'map', href: '/map', title: 'Campus Map', text: 'Find classrooms and food' },
  { icon: 'book', href: '/transfer-credits', title: 'Transfer Credits', text: 'Plan course equivalencies' },
  { icon: 'pen', href: '/blog', title: 'Blog', text: 'Read and share stories' },
]

function Dashboard() {
  const { user } = useAuth()
  const checklist = useChecklist()
  const courseMappings = useCourseMappings()
  const [eventCategory, setEventCategory] = useState('')
  const { data, error, isLoading } = useGet('/api/dashboard', { refreshInterval: 15000 })
  const { data: weather, error: weatherError } = useGet('/api/weather', { refreshInterval: 600000 })
  const eventQuery = eventCategory ? `?category=${encodeURIComponent(eventCategory)}` : ''
  const {
    data: eventsData,
    error: eventsError,
    isLoading: eventsLoading,
  } = useGet(`/api/events${eventQuery}`, { refreshInterval: 15000 })

  return (
    <div className="home">
      <WelcomeHeader displayName={user.displayName} weather={weather} weatherError={weatherError} />

      <div className="dash-grid">
        <EventsSection
          events={eventsData?.events ?? []}
          categories={eventsData?.categories ?? []}
          category={eventCategory}
          onCategoryChange={setEventCategory}
          isLoading={eventsLoading}
          error={eventsError}
        />
        <QuickLinks links={QUICK_LINKS} />

        {isLoading && <p role="status">Loading…</p>}
        {error && <p role="alert">Could not load data: {error}</p>}
        {data && (
          <>
            <LatestPosts posts={data.latestPosts} />
            <FoodSpots spots={data.foodSpots} />
          </>
        )}
        <CourseProgress
          courses={courseMappings.courses}
          error={courseMappings.error}
          isLoading={courseMappings.isLoading}
          onAdd={courseMappings.addCourse}
          onStatusChange={courseMappings.updateCourseStatus}
          onRemove={courseMappings.removeCourse}
        />
        <Checklist
          items={checklist.items}
          error={checklist.error}
          isLoading={checklist.isLoading}
          onAdd={checklist.addItem}
          onToggle={checklist.toggleItem}
          onRemove={checklist.removeItem}
        />
      </div>
    </div>
  )
}

export default Dashboard
