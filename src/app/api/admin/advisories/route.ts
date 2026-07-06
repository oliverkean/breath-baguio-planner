import { createAdvisory } from "@/features/tourism/repository"
import type { Advisory } from "@/features/tourism/types"
import { requireAdmin } from "@/features/auth/session"

const severities = new Set<Advisory["severity"]>(["info", "warning", "urgent"])

export async function POST(request: Request) {
  try {
    const user = await requireAdmin()
    const body = (await request.json()) as Record<string, unknown>
    const title = requiredString(body.title, "title")
    const area = requiredString(body.area, "area")

    const record = await createAdvisory(
      {
        title,
        area,
        severity: optionalSeverity(body.severity),
        message: optionalString(body.message, "Admin advisory pending review."),
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

function optionalSeverity(value: unknown): Advisory["severity"] {
  return typeof value === "string" && severities.has(value as Advisory["severity"])
    ? (value as Advisory["severity"])
    : "warning"
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unable to save advisory."
  const status = message.includes("Admin access") ? 401 : message.includes("DATABASE_URL") ? 503 : 400

  return Response.json({ error: message }, { status })
}
