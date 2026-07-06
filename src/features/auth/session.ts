import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

import { getUserRole } from "./repository"
import { createSupabaseAuthClient, hasSupabaseAuthConfig } from "@/lib/supabase-auth"

export type UserRole = "admin" | "traveler"
export type AuthProvider = "env" | "supabase"

export type UserSession = {
  id: string
  email: string
  role: UserRole
  provider: AuthProvider
}

const cookieName = "breathe_baguio_session"
const maxAgeSeconds = 60 * 60 * 8

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const value = cookieStore.get(cookieName)?.value

  if (!value) {
    return null
  }

  return verifySession(value)
}

export async function requireAdmin() {
  const user = await getCurrentUser()

  if (user?.role !== "admin") {
    throw new Error("Admin access is required.")
  }

  if (user.provider === "supabase") {
    const persistedRole = await getUserRole(user.id)

    if (persistedRole !== "admin") {
      throw new Error("Admin access is required.")
    }
  }

  return user
}

export async function setSession(user: UserSession) {
  const cookieStore = await cookies()

  cookieStore.set(cookieName, signSession(user), {
    httpOnly: true,
    maxAge: maxAgeSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

export async function clearSession() {
  const cookieStore = await cookies()

  cookieStore.delete(cookieName)
}

export async function authenticateAdmin(email: string, password: string): Promise<UserSession | null> {
  if (hasSupabaseAuthConfig()) {
    return authenticateSupabaseAdmin(email, password)
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured.")
  }

  if (!safeEqual(email.trim().toLowerCase(), adminEmail.trim().toLowerCase())) {
    return null
  }

  if (!safeEqual(password, adminPassword)) {
    return null
  }

  return {
    id: "env-admin",
    email: adminEmail,
    role: "admin",
    provider: "env",
  }
}

async function authenticateSupabaseAdmin(email: string, password: string): Promise<UserSession | null> {
  const supabase = createSupabaseAuthClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })

  if (error || !data.user) {
    return null
  }

  const role = await getUserRole(data.user.id)

  if (role !== "admin") {
    return null
  }

  return {
    id: data.user.id,
    email: data.user.email ?? email.trim().toLowerCase(),
    role,
    provider: "supabase",
  }
}

function signSession(user: UserSession) {
  const payload = Buffer.from(JSON.stringify(user), "utf8").toString("base64url")
  const signature = createSignature(payload)

  return `${payload}.${signature}`
}

function verifySession(value: string): UserSession | null {
  const [payload, signature] = value.split(".")

  if (!payload || !signature) {
    return null
  }

  if (!safeEqual(signature, createSignature(payload))) {
    return null
  }

  try {
    const user = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as UserSession

    if (typeof user.id !== "string" || !user.id) {
      return null
    }

    if (user.provider !== "env" && user.provider !== "supabase") {
      return null
    }

    if (user.role !== "admin" && user.role !== "traveler") {
      return null
    }

    return user
  } catch {
    return null
  }
}

function createSignature(payload: string) {
  const secret = process.env.SESSION_SECRET

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters.")
  }

  return createHmac("sha256", secret).update(payload).digest("base64url")
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}
