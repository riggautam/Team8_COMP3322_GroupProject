// Helpers for showing event days and times, used by the dashboard and the events page.
// Events happen in Hong Kong, so times are always shown in Hong Kong time, even when a
// visitor's laptop is still set to the time zone back home.
const HONG_KONG_OFFSET_MS = 8 * 60 * 60 * 1000
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Hong_Kong',
})

// Day names come from the "YYYY-MM-DD" text alone: it is read as midnight UTC and shown
// in UTC, so no time zone can move it to the day before.
const dayFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

// "7:00 PM" from "2026-11-19T19:00:00+08:00".
export function formatTime(startsAt) {
  return timeFormat.format(new Date(startsAt))
}

// "2026-11-19" from "2026-11-19T19:00:00+08:00": the event's day in Hong Kong.
export function eventDay(event) {
  return event.startsAt.slice(0, 10)
}

function nextDay(day) {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

// "Today", "Tomorrow" or a short date such as "Sat, 21 Nov".
// today is the server's date, sent with the events by GET /api/events.
export function dayLabel(day, today) {
  if (day === today) return 'Today'
  if (day === nextDay(today)) return 'Tomorrow'
  return dayFormat.format(new Date(`${day}T00:00:00Z`))
}

// Splits a list that is already sorted by time into one group per day: [{ day, events }].
export function groupByDay(events) {
  const groups = []
  for (const event of events) {
    const day = eventDay(event)
    const lastGroup = groups.at(-1)
    if (lastGroup?.day === day) {
      lastGroup.events.push(event)
    } else {
      groups.push({ day, events: [event] })
    }
  }
  return groups
}

// A moment as Hong Kong clock time, "YYYY-MM-DDTHH:mm", the format a datetime-local input uses.
// toISOString() prints UTC, so moving the time 8 hours on prints the Hong Kong clock time.
function toHongKongInput(ms) {
  return new Date(ms + HONG_KONG_OFFSET_MS).toISOString().slice(0, 16)
}

// The earliest and latest start times the server accepts for a new event.
export function hongKongNow() {
  return toHongKongInput(Date.now())
}

export function hongKongInAYear() {
  return toHongKongInput(Date.now() + ONE_YEAR_MS)
}
