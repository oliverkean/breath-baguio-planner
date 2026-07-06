import { describe, expect, it } from "vitest"

import { checkLoginRateLimit, clearLoginRateLimit, recordFailedLogin } from "./rate-limit"

describe("login rate limit", () => {
  it("blocks after repeated failed attempts and clears after success", () => {
    const key = `test:${crypto.randomUUID()}`

    for (let index = 0; index < 5; index += 1) {
      expect(checkLoginRateLimit(key).allowed).toBe(true)
      recordFailedLogin(key)
    }

    expect(checkLoginRateLimit(key).allowed).toBe(false)

    clearLoginRateLimit(key)

    expect(checkLoginRateLimit(key).allowed).toBe(true)
  })
})
