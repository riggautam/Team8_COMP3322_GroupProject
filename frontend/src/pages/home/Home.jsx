import useGet from '../../hooks/useGet.js'
import EventsSection from '../../components/dashboard/EventsSection.jsx'
import FoodSpots from '../../components/dashboard/FoodSpots.jsx'
import LatestPosts from '../../components/dashboard/LatestPosts.jsx'
import QuickLinks from '../../components/dashboard/QuickLinks.jsx'
import WelcomeHeader from '../../components/dashboard/WelcomeHeader.jsx'
import './Home.css'

function Home() {
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
        <section className="dash-card" aria-labelledby="personal-dashboard-title">
          <h2 id="personal-dashboard-title">Your personal dashboard</h2>
          <p>Course mapping and checklist syncing will be available when secure sign-in is connected.</p>
        </section>
      </div>
    </div>
  )
}

export default Home
