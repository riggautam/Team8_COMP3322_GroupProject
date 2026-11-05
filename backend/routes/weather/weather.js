const express = require('express')

const router = express.Router()
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=22.3027&longitude=114.1772&current=temperature_2m,weather_code&timezone=Asia%2FHong_Kong'

function describeWeather(code) {
  if (code === 0) return 'Clear'
  if (code === 1) return 'Mainly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Foggy'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 67) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Rain showers'
  if (code === 85 || code === 86) return 'Snow showers'
  if (code === 95 || code === 96 || code === 99) return 'Thunderstorms'
  return 'Current conditions'
}

router.get('/', async (req, res, next) => {
  try {
    const response = await fetch(WEATHER_URL, { signal: AbortSignal.timeout(10000) })
    if (!response.ok) {
      throw new Error(`Weather provider returned ${response.status}`)
    }

    const data = await response.json()
    const tempC = data?.current?.temperature_2m
    const code = data?.current?.weather_code
    if (!Number.isFinite(tempC) || !Number.isInteger(code)) {
      throw new Error('Weather provider returned an invalid response')
    }

    res.set('Cache-Control', 'public, max-age=300')
    res.json({ tempC: Math.round(tempC), condition: describeWeather(code) })
  } catch (error) {
    next(error)
  }
})

module.exports = router
