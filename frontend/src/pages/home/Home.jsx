import useApi from '../../hooks/useApi.js'
import Checklist from '../../components/dashboard/Checklist.jsx'
import CourseProgress from '../../components/dashboard/CourseProgress.jsx'
import EventsSection from '../../components/dashboard/EventsSection.jsx'
import FoodSpots from '../../components/dashboard/FoodSpots.jsx'
import LatestPosts from '../../components/dashboard/LatestPosts.jsx'
import QuickLinks from '../../components/dashboard/QuickLinks.jsx'
import WelcomeHeader from '../../components/dashboard/WelcomeHeader.jsx'
import './Home.css'

function Home() {
  const { data, error, isLoading } = useApi('/api/dashboard')

  return (
    <div className="home">
      <WelcomeHeader weather={data?.weather} />

      <div className="dash-grid">
        <EventsSection />
        <QuickLinks />

        {isLoading && <p role="status">Loading…</p>}
        {error && <p role="alert">Could not load data: {error}</p>}
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

export default Home
