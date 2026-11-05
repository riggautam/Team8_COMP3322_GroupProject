import { useEffect, useState } from 'react'
import PageBanner from './PageBanner.jsx'

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

function WelcomeHeader({ displayName, weather, weatherError }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const hour = Number(
    new Intl.DateTimeFormat('en', { hour: 'numeric', hour12: false, timeZone: 'Asia/Hong_Kong' }).format(now),
  ) % 24
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const description = [
    `${dateFormat.format(now)} · ${timeFormat.format(now)} in Hong Kong`,
    weather && `${weather.tempC}°C, ${weather.condition}`,
    weatherError && 'Weather currently unavailable',
  ].filter(Boolean).join(' · ')

  return (
    <PageBanner title={`${greeting}, ${displayName}!`} description={description} />
  )
}

export default WelcomeHeader
