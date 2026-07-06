import { redirect } from "next/navigation"

import { requireAdmin } from "@/features/auth/session"
import { AdminWorkspace } from "@/features/tourism/components/admin-workspace"
import { getTourismData } from "@/features/tourism/repository"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  let user

  try {
    user = await requireAdmin()
  } catch {
    redirect("/login?next=/admin")
  }

  const tourismData = await getTourismData()

  return <AdminWorkspace initialData={tourismData} userEmail={user.email} />
}
