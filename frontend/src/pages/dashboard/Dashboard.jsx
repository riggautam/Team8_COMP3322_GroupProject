import useGet from '../../hooks/useGet.js'
import Checklist from './components/Checklist.jsx'
import CourseProgress from './components/CourseProgress.jsx'
import EventsSection from './components/EventsSection.jsx'
import FoodSpots from './components/FoodSpots.jsx'
import LatestPosts from './components/LatestPosts.jsx'
import QuickLinks from './components/QuickLinks.jsx'
import WelcomeHeader from './components/WelcomeHeader.jsx'
import './Dashboard.css'

function Dashboard() {
  const { data, error, isLoading } = useGet('/api/dashboard', { refreshInterval: 15000 })
  const { data: weather, error: weatherError } = useGet('/api/weather', { refreshInterval: 600000 })

  return (
    <div className="home">
      <WelcomeHeader weather={weather} weatherError={weatherError} />

      <div className="dash-grid">
        <EventsSection />
        <QuickLinks />

        {isLoading && <p role="status">Loading…</p>}
        {error && <p role="alert">Could not load data: {error}</p>}
        {data && (
          <>
            <LatestPosts posts={data.latestPosts} />
            <FoodSpots spots={data.foodSpots} />
          </>
        )}
        <CourseProgress />
        <Checklist />      </div>
    </div>
  )
}

export default Dashboard
