import { authenticateAdmin, setSession } from "@/features/auth/session"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const email = typeof body.email === "string" ? body.email : ""
    const password = typeof body.password === "string" ? body.password : ""
    const user = authenticateAdmin(email, password)

    if (!user) {
      return Response.json({ error: "Invalid admin credentials." }, { status: 401 })
    }

    await setSession(user)

    return Response.json({ user })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to log in."

    return Response.json({ error: message }, { status: 500 })
  }
}
