// Placeholder data until the MySQL events table is available.
const CATEGORIES = ['Academic', 'Social', 'Food', 'Culture', 'Sports']

const SAMPLE_EVENTS = [
  { id: 1, title: 'Exchange Student Orientation', category: 'Academic', hour: 10, location: 'Main Building', description: 'Meet the exchange office and learn how registration and course add/drop work.' },
  { id: 2, title: 'Language Exchange Cafe', category: 'Social', hour: 12, location: 'Centennial Campus Cafe', description: 'Practice Cantonese, English and more over lunch.' },
  { id: 3, title: 'Street Food Tour: Sai Ying Pun', category: 'Food', hour: 15, location: 'Sai Ying Pun MTR Exit B2', description: 'Guided walk through local dim sum and tea spots near campus.' },
  { id: 4, title: 'Hong Kong Heritage Walk', category: 'Culture', hour: 16, location: 'Hong Kong Museum of Medical Sciences', description: 'Visit nearby heritage sites with student guides.' },
  { id: 5, title: 'Evening Badminton Meetup', category: 'Sports', hour: 19, location: 'Sports Centre', description: 'Casual doubles open to all levels. Rackets provided.' },
]

function getTodaysEvents(now = new Date()) {
  return SAMPLE_EVENTS.map(({ hour, ...event }) => {
    const start = new Date(now)
    start.setHours(hour, 0, 0, 0)
    return { ...event, startsAt: start.toISOString() }
  })
}

module.exports = { CATEGORIES, getTodaysEvents }
