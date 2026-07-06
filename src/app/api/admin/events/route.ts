import { createTourismEvent } from "@/features/tourism/repository"
import type { CrowdLevel } from "@/features/tourism/types"
import { requireAdmin } from "@/features/auth/session"

const crowdLevels = new Set<CrowdLevel>(["low", "moderate", "high", "critical"])

export async function POST(request: Request) {
  try {
    const user = await requireAdmin()
    const body = (await request.json()) as Record<string, unknown>
    const name = requiredString(body.name, "name")
    const startsOn = requiredString(body.startsOn, "startsOn")
    const endsOn = optionalString(body.endsOn, startsOn)
    const impact = optionalCrowdLevel(body.impact)

    const record = await createTourismEvent(
      {
        name,
        startsOn,
        endsOn,
        impact,
        notes: optionalString(body.notes, "Admin event needs source verification."),
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

function optionalCrowdLevel(value: unknown): CrowdLevel {
  return typeof value === "string" && crowdLevels.has(value as CrowdLevel) ? (value as CrowdLevel) : "high"
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unable to save event."
  const status = message.includes("Admin access") ? 401 : message.includes("DATABASE_URL") ? 503 : 400

  return Response.json({ error: message }, { status })
}
