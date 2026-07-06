import { config } from "dotenv"
import { Pool } from "pg"

config({ path: ".env.local" })
config()

const email = process.argv[2]
const role = process.argv[3] || "admin"
const connectionString = getDatabaseUrl()

if (!email) {
  throw new Error("Usage: npm run db:grant-admin -- admin@example.com")
}

if (role !== "admin" && role !== "traveler") {
  throw new Error("Role must be admin or traveler.")
}

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL must be configured.")
}

const pool = new Pool({ connectionString, max: 1 })

async function main() {
  const userResult = await pool.query<{ id: string }>(
    "select id from auth.users where lower(email) = lower($1) limit 1",
    [email],
  )
  const userId = userResult.rows[0]?.id

  if (!userId) {
    throw new Error(`No Supabase Auth user found for ${email}. Create the user first, then rerun this command.`)
  }

  await pool.query(
    `
      insert into public.user_roles (user_id, role)
      values ($1, $2)
      on conflict (user_id)
      do update set role = excluded.role, updated_at = now()
    `,
    [userId, role],
  )

  console.log(`Granted ${role} role to ${email}.`)
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
