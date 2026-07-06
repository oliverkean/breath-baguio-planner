import { beforeEach, describe, expect, it, vi } from "vitest"

import type { UserSession } from "@/features/auth/session"

const authenticateAdmin = vi.fn()
const setSession = vi.fn()
const checkLoginRateLimit = vi.fn()
const recordFailedLogin = vi.fn()
const clearLoginRateLimit = vi.fn()

vi.mock("@/features/auth/session", () => ({
  authenticateAdmin,
  setSession,
}))

vi.mock("@/features/auth/rate-limit", () => ({
  checkLoginRateLimit,
  clearLoginRateLimit,
  recordFailedLogin,
}))

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkLoginRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0 })
  })

  it("sets a session for valid admin credentials", async () => {
    const user: UserSession = {
      id: "env-admin",
      email: "admin@example.com",
      provider: "env",
      role: "admin",
    }

    authenticateAdmin.mockResolvedValue(user)

    const { POST } = await import("./route")
    const response = await POST(loginRequest())

    expect(response.status).toBe(200)
    expect(setSession).toHaveBeenCalledWith(user)
    expect(clearLoginRateLimit).toHaveBeenCalledWith("127.0.0.1:admin@example.com")
  })

  it("records failed attempts for invalid credentials", async () => {
    authenticateAdmin.mockResolvedValue(null)

    const { POST } = await import("./route")
    const response = await POST(loginRequest())

    expect(response.status).toBe(401)
    expect(recordFailedLogin).toHaveBeenCalledWith("127.0.0.1:admin@example.com")
    expect(setSession).not.toHaveBeenCalled()
  })

  it("returns retry-after when rate limited", async () => {
    checkLoginRateLimit.mockReturnValue({ allowed: false, retryAfterSeconds: 60 })

    const { POST } = await import("./route")
    const response = await POST(loginRequest())

    expect(response.status).toBe(429)
    expect(response.headers.get("Retry-After")).toBe("60")
    expect(authenticateAdmin).not.toHaveBeenCalled()
  })
})

function loginRequest() {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "127.0.0.1",
    },
    body: JSON.stringify({
      email: "admin@example.com",
      password: "password",
    }),
  })
}
