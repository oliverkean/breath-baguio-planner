import { authenticateAdmin, setSession } from "@/features/auth/session"
import { checkLoginRateLimit, clearLoginRateLimit, recordFailedLogin } from "@/features/auth/rate-limit"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const email = typeof body.email === "string" ? body.email : ""
    const password = typeof body.password === "string" ? body.password : ""
    const rateLimitKey = getRateLimitKey(request, email)
    const rateLimit = checkLoginRateLimit(rateLimitKey)

    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Too many sign-in attempts. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      )
    }

    const user = await authenticateAdmin(email, password)

    if (!user) {
      recordFailedLogin(rateLimitKey)
      return Response.json({ error: "Invalid admin credentials." }, { status: 401 })
    }

    clearLoginRateLimit(rateLimitKey)
    await setSession(user)

    return Response.json({ user })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to log in."

    return Response.json({ error: message }, { status: 500 })
  }
}

function getRateLimitKey(request: Request, email: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const ip = forwardedFor || request.headers.get("x-real-ip") || "unknown-ip"

  return `${ip}:${email.trim().toLowerCase()}`
}
