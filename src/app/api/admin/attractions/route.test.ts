import { beforeEach, describe, expect, it, vi } from "vitest"

const requireAdmin = vi.fn()
const createAttraction = vi.fn()

vi.mock("@/features/auth/session", () => ({
  requireAdmin,
}))

vi.mock("@/features/tourism/repository", () => ({
  createAttraction,
}))

describe("POST /api/admin/attractions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAdmin.mockResolvedValue({
      id: "11111111-1111-1111-1111-111111111111",
      email: "admin@example.com",
      provider: "supabase",
      role: "admin",
    })
    createAttraction.mockResolvedValue({
      id: "attraction-1",
      name: "Mirador Heritage Park",
    })
  })

  it("passes the authenticated admin actor into the repository", async () => {
    const { POST } = await import("./route")
    const response = await POST(
      new Request("http://localhost/api/admin/attractions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district: "Dominican Hill",
          name: "Mirador Heritage Park",
        }),
      }),
    )

    expect(response.status).toBe(201)
    expect(createAttraction).toHaveBeenCalledWith(
      expect.objectContaining({
        district: "Dominican Hill",
        name: "Mirador Heritage Park",
      }),
      { userId: "11111111-1111-1111-1111-111111111111" },
    )
  })

  it("rejects unauthenticated writes", async () => {
    requireAdmin.mockRejectedValue(new Error("Admin access is required."))

    const { POST } = await import("./route")
    const response = await POST(
      new Request("http://localhost/api/admin/attractions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district: "Dominican Hill",
          name: "Mirador Heritage Park",
        }),
      }),
    )

    expect(response.status).toBe(401)
    expect(createAttraction).not.toHaveBeenCalled()
  })
})
