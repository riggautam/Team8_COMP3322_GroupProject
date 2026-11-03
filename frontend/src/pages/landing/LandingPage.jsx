import { Link } from 'react-router'
import './LandingPage.css'

const FEATURES = [
  {
    title: 'Plan your studies',
    description: 'Explore course-transfer resources and keep your exchange plans organised.',
    to: '/transfer-credits',
    link: 'Explore transfer credits',
  },
  {
    title: 'Find your way',
    description: 'Discover campus places and food spots around HKU.',
    to: '/map',
    link: 'Open the campus map',
  },
  {
    title: 'Hear from students',
    description: 'Read practical tips and stories from the exchange community.',
    to: '/blog',
    link: 'Read the student blog',
  },
]

function LandingPage() {
  return (
    <div className="landing-page">
      <section className="landing-hero">
        <p className="landing-eyebrow">Your HKU exchange starts here</p>
        <h1>Make the most of your time in Hong Kong.</h1>
        <p className="landing-intro">
          Find your way around campus, plan your studies, and get to know the
          city with WEST — a hub made for HKU exchange students.
        </p>
        <div className="landing-actions">
          <Link className="landing-primary-link" to="/login">Log in to your dashboard</Link>
          <Link className="landing-secondary-link" to="/blog">Explore student stories</Link>
        </div>
        <svg className="landing-skyline" viewBox="0 0 320 100" aria-hidden="true">
          <path d="M0 100V66h24V38h18v28h18V20h24v46h16V48h22v18h18V30h24v36h22V52h22v14h20V32h17v34h25v34z" />
        </svg>
      </section>

      <section className="landing-features" aria-labelledby="landing-features-title">
        <div className="landing-section-heading">
          <p className="landing-eyebrow">A smoother exchange</p>
          <h2 id="landing-features-title">Everything you need to get started</h2>
        </div>
        <div className="landing-feature-grid">
          {FEATURES.map((feature) => (
            <article className="landing-feature-card" key={feature.to}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link to={feature.to}>{feature.link} <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default LandingPage
