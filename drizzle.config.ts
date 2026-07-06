import { defineConfig } from "drizzle-kit"
import { config } from "dotenv"

config({ path: ".env.local" })
config()

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
})

function getDatabaseUrl() {
  const directUrl = validUrl(process.env.DIRECT_URL)

  if (directUrl) {
    return directUrl
  }

  if (process.env.DIRECT_URL) {
    console.warn("DIRECT_URL is not a valid URL. Falling back to DATABASE_URL.")
  }

  return validUrl(process.env.DATABASE_URL) || ""
}

function validUrl(value: string | undefined) {
  if (!value) {
    return null
  }

  try {
    new URL(value)
    return value
  } catch {
    return null
  }
}
