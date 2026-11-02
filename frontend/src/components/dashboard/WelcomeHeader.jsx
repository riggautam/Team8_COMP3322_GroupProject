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
      <div>
      <h1>{greeting}, welcome to HKU!</h1>
      <p>
        {dateFormat.format(now)} · {timeFormat.format(now)} in Hong Kong
        {weather && ` · ${weather.tempC}°C, ${weather.condition}`}
      </p>
      </div>
      <svg className="dash-skyline" viewBox="0 0 200 60" aria-hidden="true">
        <path d="M0 60V38h14V24h10v14h10V12h12v26h10V30h14v8h10V18h12v20h12V28h14v10h12V22h10v38z" />
        <path className="dash-skyline-wave" d="M0 52q12-6 25 0t25 0 25 0 25 0 25 0 25 0 25 0 25 0v8H0z" />
      </svg>
    </header>
  )
}

export default WelcomeHeader
