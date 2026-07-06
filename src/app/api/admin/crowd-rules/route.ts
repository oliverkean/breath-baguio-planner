import { createCrowdRule } from "@/features/tourism/repository"
import { requireAdmin } from "@/features/auth/session"

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = (await request.json()) as Record<string, unknown>
    const label = requiredString(body.label, "label")
    const condition = requiredString(body.condition, "condition")
    const scoreImpact = Number(body.scoreImpact)

    if (!Number.isFinite(scoreImpact) || scoreImpact < -100 || scoreImpact > 100) {
      throw new Error("scoreImpact must be a number between -100 and 100.")
    }

    const record = await createCrowdRule({
      label,
      condition,
      scoreImpact,
    })

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

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unable to save crowd rule."
  const status = message.includes("Admin access") ? 401 : message.includes("DATABASE_URL") ? 503 : 400

  return Response.json({ error: message }, { status })
}
