import type { CrowdLevel, ItineraryRequest, TourismData, TourismEvent } from "./types"

const levelFloor: Record<CrowdLevel, number> = {
  low: 20,
  moderate: 45,
  high: 68,
  critical: 86,
}

const levelRank: Record<CrowdLevel, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  critical: 3,
}

export function getCrowdLevel(score: number): CrowdLevel {
  if (score >= 85) {
    return "critical"
  }

  if (score >= 65) {
    return "high"
  }

  if (score >= 40) {
    return "moderate"
  }

  return "low"
}

export function getHighestCrowdLevel(levels: CrowdLevel[]): CrowdLevel {
  return levels.reduce<CrowdLevel>((highest, level) => {
    return levelRank[level] > levelRank[highest] ? level : highest
  }, "low")
}

export function getEventsForDate(date: Date, events: TourismEvent[]) {
  return events.filter((event) => {
    const start = parseDate(event.startsOn)
    const end = parseDate(event.endsOn)

    return date >= start && date <= end
  })
}

export function scoreCrowdForDate(
  date: Date,
  request: Pick<ItineraryRequest, "transportMode">,
  data: TourismData
) {
  const weekend = [0, 5, 6].includes(date.getDay())
  const events = getEventsForDate(date, data.events)
  const eventLevel = getHighestCrowdLevel(events.map((event) => event.impact))
  const eventImpact = events.length > 0 ? levelFloor[eventLevel] - 35 : 0
  const privateCarImpact = request.transportMode === "private-car" ? 12 : 0
  const base = weekend ? 48 : 26
  const score = clamp(base + eventImpact + privateCarImpact, 0, 100)

  return {
    score,
    level: getCrowdLevel(score),
    factors: [
      weekend ? "Weekend demand" : "Weekday baseline",
      ...events.map((event) => event.name),
      request.transportMode === "private-car" ? "Private-car pressure" : "Car-light plan",
    ],
  }
}

export function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return new Date()
  }

  return date
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)

  return next
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
