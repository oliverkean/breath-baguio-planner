import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import { config } from "dotenv"
import { Pool } from "pg"

config({ path: ".env.local" })
config()

const connectionString = getDatabaseUrl()

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL must be configured.")
}

const pool = new Pool({ connectionString, max: 1 })

async function main() {
  const sql = await readFile(resolve("drizzle", "rls.sql"), "utf8")
  await pool.query(sql)
  console.log("Applied Supabase RLS policies.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })

function getDatabaseUrl() {
  const directUrl = validUrl(process.env.DIRECT_URL)

  if (directUrl) {
    return directUrl
  }

  if (process.env.DIRECT_URL) {
    console.warn("DIRECT_URL is not a valid URL. Falling back to DATABASE_URL.")
  }

  return validUrl(process.env.DATABASE_URL)
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
