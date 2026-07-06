import { redirect } from "next/navigation"

import { LoginForm } from "@/features/auth/login-form"
import { getCurrentUser } from "@/features/auth/session"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const user = await getCurrentUser()
  const { next } = await searchParams

  if (user?.role === "admin") {
    redirect(next || "/admin")
  }

  return <LoginForm nextPath={next || "/admin"} />
}
