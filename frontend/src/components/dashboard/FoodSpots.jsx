import { Link } from 'react-router'
import SectionHeading from '../ui/SectionHeading.jsx'

function FoodSpots({ spots }) {
  return (
    <section className="dash-card" aria-labelledby="food-title">
      <SectionHeading id="food-title" icon="utensils">Food near campus</SectionHeading>
      {spots.length === 0 ? (
        <p>No food spots to show yet.</p>
      ) : (
        <ul className="dash-list">
          {spots.map((spot) => (
            <li key={spot.id}>
              <strong>{spot.name}</strong>
              <p className="dash-meta">
                {spot.cuisine} · {spot.walkMinutes} min walk
              </p>
            </li>
          ))}
        </ul>
      )}
      <Link to="/map">Open the map</Link>
    </section>
  )
}

export default FoodSpots
