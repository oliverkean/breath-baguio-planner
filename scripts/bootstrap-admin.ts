import { config } from "dotenv"
import { Pool } from "pg"
import { createClient } from "@supabase/supabase-js"

config({ path: ".env.local" })
config()

const appConfig = getConfig()

const supabase = createClient(appConfig.supabaseUrl, appConfig.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
const pool = new Pool({ connectionString: appConfig.connectionString, max: 1 })

async function main() {
  const userId = await findOrCreateUser(appConfig.adminEmail, appConfig.adminPassword)

  await pool.query(
    `
      insert into public.user_roles (user_id, role)
      values ($1, 'admin')
      on conflict (user_id)
      do update set role = 'admin', updated_at = now()
    `,
    [userId],
  )

  console.log(`Bootstrapped Supabase admin user for ${appConfig.adminEmail}.`)
}

async function findOrCreateUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const existingUser = await findUserByEmail(normalizedEmail)

  if (existingUser) {
    return existingUser.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    throw new Error(error?.message || `Unable to create Supabase Auth user for ${normalizedEmail}.`)
  }

  return data.user.id
}

async function findUserByEmail(email: string) {
  let page = 1

  while (page < 50) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 })

    if (error) {
      throw new Error(error.message)
    }

    const user = data.users.find((item) => item.email?.toLowerCase() === email)

    if (user) {
      return user
    }

    if (data.users.length < 100) {
      return null
    }

    page += 1
  }

  return null
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

function getConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const connectionString = getDatabaseUrl()

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.")
  }

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured.")
  }

  if (!connectionString) {
    throw new Error("DIRECT_URL or DATABASE_URL must be configured.")
  }

  return {
    adminEmail,
    adminPassword,
    connectionString,
    serviceRoleKey,
    supabaseUrl,
  }
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
