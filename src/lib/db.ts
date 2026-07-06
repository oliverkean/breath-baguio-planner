import "server-only"

import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "@/db/schema"

let pool: Pool | undefined

export function getDb() {
  if (!process.env.DATABASE_URL) {
    return null
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
  })

  return drizzle(pool, { schema })
}
