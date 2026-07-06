import "server-only"

import { eq } from "drizzle-orm"

import { userRoles } from "@/db/schema"
import { getDb } from "@/lib/db"
import type { UserRole } from "./session"

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const db = getDb()

  if (!db) {
    return null
  }

  const [record] = await db.select({ role: userRoles.role }).from(userRoles).where(eq(userRoles.userId, userId)).limit(1)

  return record?.role ?? null
}

export async function grantUserRole(userId: string, role: UserRole) {
  const db = requireDb()

  const [record] = await db
    .insert(userRoles)
    .values({ userId, role })
    .onConflictDoUpdate({
      target: userRoles.userId,
      set: {
        role,
        updatedAt: new Date(),
      },
    })
    .returning()

  return record
}

function requireDb() {
  const db = getDb()

  if (!db) {
    throw new Error("DATABASE_URL is not configured.")
  }

  return db
}
