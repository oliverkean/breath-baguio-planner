import { createAttraction } from "@/features/tourism/repository"
import type { CrowdLevel } from "@/features/tourism/types"
import { requireAdmin } from "@/features/auth/session"

const crowdLevels = new Set<CrowdLevel>(["low", "moderate", "high", "critical"])

export async function POST(request: Request) {
  try {
    const user = await requireAdmin()
    const body = (await request.json()) as Record<string, unknown>
    const name = requiredString(body.name, "name")
    const district = requiredString(body.district, "district")
    const location = optionalString(body.location, "Admin added location")
    const openingHours = optionalString(body.openingHours, "Hours to verify")
    const baselineCrowd = optionalCrowdLevel(body.baselineCrowd)
    const durationHours = optionalNumber(body.durationHours, 2)
    const tags = parseTags(body.tags)

    const record = await createAttraction(
      {
        name,
        district,
        location,
        openingHours,
        tags,
        baselineCrowd,
        carFreeHint: optionalString(body.carFreeHint, "Verify car-free access guidance before publishing."),
        wasteReminder: optionalString(body.wasteReminder, "Confirm waste guidance before publishing."),
        durationHours,
        sourceName: optionalSourceString(body.sourceName),
        sourceUrl: optionalSourceString(body.sourceUrl),
      },
      { userId: user.id },
    )

    return Response.json({ record }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`)
  }

  return value.trim()
}

function optionalString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

function optionalSourceString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function optionalNumber(value: unknown, fallback: number) {
  const number = Number(value)

  return Number.isFinite(number) && number > 0 ? number : fallback
}

function optionalCrowdLevel(value: unknown): CrowdLevel {
  return typeof value === "string" && crowdLevels.has(value as CrowdLevel) ? (value as CrowdLevel) : "moderate"
}

function parseTags(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).map((tag) => tag.trim()).filter(Boolean)
  }

  if (typeof value === "string") {
    return value.split(",").map((tag) => tag.trim()).filter(Boolean)
  }

  return ["admin"]
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unable to save attraction."
  const status = message.includes("Admin access") ? 401 : message.includes("DATABASE_URL") ? 503 : 400

  return Response.json({ error: message }, { status })
}
