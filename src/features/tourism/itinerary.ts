import { addDays, parseDate, scoreCrowdForDate, toDateInputValue } from "./crowd"
import { ecoReminders } from "./data"
import type {
  Attraction,
  ItineraryDay,
  ItineraryRequest,
  ItineraryResult,
  TourismData,
} from "./types"

const defaultRequest: ItineraryRequest = {
  days: 2,
  budget: "low",
  transportMode: "no-private-car",
  startDate: toDateInputValue(new Date()),
  interests: ["parks", "culture", "food"],
  notes: "2-day Baguio trip, low budget, no private car",
}

export function getDefaultItineraryRequest(): ItineraryRequest {
  return defaultRequest
}

export function normalizeItineraryRequest(input: Partial<ItineraryRequest>): ItineraryRequest {
  return {
    days: clampInteger(input.days ?? defaultRequest.days, 1, 5),
    budget: input.budget ?? defaultRequest.budget,
    transportMode: input.transportMode ?? defaultRequest.transportMode,
    startDate: input.startDate || defaultRequest.startDate,
    interests: input.interests?.length ? input.interests : defaultRequest.interests,
    notes: input.notes?.trim() || defaultRequest.notes,
  }
}

export function generateLocalItinerary(
  requestInput: Partial<ItineraryRequest>,
  data: TourismData
): ItineraryResult {
  const request = normalizeItineraryRequest(requestInput)
  const start = parseDate(request.startDate)
  const rankedAttractions = rankAttractions(data.attractions, request)
  const days: ItineraryDay[] = Array.from({ length: request.days }, (_, index) => {
    const date = addDays(start, index)
    const crowd = scoreCrowdForDate(date, request, data)
    const stopOffset = index * 3
    const stops = rankedAttractions.slice(stopOffset, stopOffset + 3)

    return {
      day: index + 1,
      date: toDateInputValue(date),
      crowdLevel: crowd.level,
      crowdScore: crowd.score,
      summary: buildDaySummary(crowd.level, request.transportMode),
      stops: stops.map((attraction, stopIndex) => ({
        time: ["08:00", "11:00", "15:00"][stopIndex] ?? "16:00",
        attractionId: attraction.id,
        title: attraction.name,
        district: attraction.district,
        guidance: `${attraction.carFreeHint} ${attraction.wasteReminder}`,
      })),
    }
  })

  return {
    source: "local-rules",
    title: `${request.days}-day responsible Baguio plan`,
    assumptions: [
      `Budget: ${request.budget}`,
      `Transport: ${request.transportMode.replaceAll("-", " ")}`,
      "Crowd estimates are rule-based and should be replaced with verified city data before production use.",
    ],
    carFreeSuggestions: getCarFreeSuggestions(request.transportMode, data.attractions),
    ecoReminders,
    days,
  }
}

function rankAttractions(attractions: Attraction[], request: ItineraryRequest) {
  return [...attractions].sort((left, right) => {
    const leftScore = attractionScore(left, request)
    const rightScore = attractionScore(right, request)

    return rightScore - leftScore
  })
}

function attractionScore(attraction: Attraction, request: ItineraryRequest) {
  const interestScore = attraction.tags.filter((tag) => request.interests.includes(tag)).length * 12
  const budgetScore = request.budget === "low" && attraction.tags.includes("budget") ? 12 : 0
  const carFreeScore =
    request.transportMode === "no-private-car" && attraction.tags.includes("walkable") ? 10 : 0
  const congestionPenalty = attraction.baselineCrowd === "critical" ? -6 : 0

  return interestScore + budgetScore + carFreeScore + congestionPenalty
}

function buildDaySummary(level: string, transportMode: string) {
  if (level === "critical") {
    return "Keep the day short, start early, and avoid stacking high-traffic attractions."
  }

  if (transportMode === "no-private-car") {
    return "Use walkable clusters and shared rides for farther stops."
  }

  return "Reserve parking once and avoid short car hops between central attractions."
}

function getCarFreeSuggestions(transportMode: string, attractions: Attraction[]) {
  if (transportMode === "private-car") {
    return [
      "Park once outside the central business district and walk between nearby stops.",
      "Avoid driving into Burnham Park, Session Road, and Mines View during peak hours.",
      "Shift high-demand viewpoints to early morning.",
    ]
  }

  return attractions
    .filter((attraction) => attraction.tags.includes("walkable") || attraction.tags.includes("high-traffic"))
    .slice(0, 4)
    .map((attraction) => attraction.carFreeHint)
}

function clampInteger(value: number, min: number, max: number) {
  const integer = Number.isFinite(value) ? Math.round(value) : min

  return Math.min(Math.max(integer, min), max)
}
