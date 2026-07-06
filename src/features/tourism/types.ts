export type CrowdLevel = "low" | "moderate" | "high" | "critical"

export type BudgetLevel = "low" | "mid" | "premium"

export type TransportMode = "no-private-car" | "private-car" | "mixed"

export type Attraction = {
  id: string
  name: string
  district: string
  location: string
  openingHours: string
  tags: string[]
  baselineCrowd: CrowdLevel
  carFreeHint: string
  wasteReminder: string
  durationHours: number
}

export type TourismEvent = {
  id: string
  name: string
  startsOn: string
  endsOn: string
  impact: CrowdLevel
  notes: string
}

export type Advisory = {
  id: string
  title: string
  severity: "info" | "warning" | "urgent"
  area: string
  message: string
}

export type CrowdRule = {
  id: string
  label: string
  condition: string
  scoreImpact: number
}

export type TourismData = {
  attractions: Attraction[]
  events: TourismEvent[]
  advisories: Advisory[]
  crowdRules: CrowdRule[]
}

export type ItineraryRequest = {
  days: number
  budget: BudgetLevel
  transportMode: TransportMode
  startDate: string
  interests: string[]
  notes: string
}

export type ItineraryStop = {
  time: string
  attractionId: string
  title: string
  district: string
  guidance: string
}

export type ItineraryDay = {
  day: number
  date: string
  crowdLevel: CrowdLevel
  crowdScore: number
  summary: string
  stops: ItineraryStop[]
}

export type ItineraryResult = {
  source: "local-rules" | "openai"
  title: string
  assumptions: string[]
  carFreeSuggestions: string[]
  ecoReminders: string[]
  days: ItineraryDay[]
}
