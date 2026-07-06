import { redirect } from "next/navigation"

import { LoginForm } from "@/features/auth/login-form"
import { requireAdmin } from "@/features/auth/session"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const nextPath = normalizeNextPath(next)
  let isAdmin = false

  try {
    await requireAdmin()
    isAdmin = true
  } catch {
    isAdmin = false
  }

  if (isAdmin) {
    redirect(nextPath)
  }

  return <LoginForm nextPath={nextPath} />
}

function normalizeNextPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin"
  }

  return value
}
