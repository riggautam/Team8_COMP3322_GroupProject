function FoodSpots({ spots }) {
  return (
    <section className="dash-card" aria-labelledby="food-title">
      <h2 id="food-title">Food near campus</h2>
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
      <a href="/map">Open the map</a>
    </section>
  )
}

export default FoodSpots
