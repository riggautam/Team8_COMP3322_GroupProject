import { useEffect, useState } from 'react'

const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Hong_Kong',
})
const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Hong_Kong',
})

function WelcomeHeader({ weather }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const hour = Number(
    new Intl.DateTimeFormat('en', { hour: 'numeric', hour12: false, timeZone: 'Asia/Hong_Kong' }).format(now),
  ) % 24
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="dash-welcome">
      <h1>{greeting}, welcome to HKU!</h1>
      <p className="dash-meta">
        {dateFormat.format(now)} · {timeFormat.format(now)} in Hong Kong
        {weather && ` · ${weather.tempC}°C, ${weather.condition}`}
      </p>
    </header>
  )
}

export default WelcomeHeader
