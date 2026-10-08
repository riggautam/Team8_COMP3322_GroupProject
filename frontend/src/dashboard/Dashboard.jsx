import useApi from '../hooks/useApi.js'
import Checklist from './Checklist.jsx'
import CourseProgress from './CourseProgress.jsx'
import EventsSection from './EventsSection.jsx'
import FoodSpots from './FoodSpots.jsx'
import LatestPosts from './LatestPosts.jsx'
import QuickLinks from './QuickLinks.jsx'
import WelcomeHeader from './WelcomeHeader.jsx'
import './Dashboard.css'

function Dashboard() {
  const { data, error, isLoading } = useApi('/api/dashboard')

  return (
    <div className="dashboard">
      <WelcomeHeader weather={data?.weather} />

      <div className="dash-grid">
        <EventsSection />
        <QuickLinks />

        {isLoading && <p role="status">Loading dashboard…</p>}
        {error && <p role="alert">Could not load dashboard data: {error}</p>}
        {data && (
          <>
            <CourseProgress courses={data.courseMapping} />
            <LatestPosts posts={data.latestPosts} />
            <FoodSpots spots={data.foodSpots} />
          </>
        )}
        <Checklist />
      </div>
    </div>
  )
}

export default Dashboard
