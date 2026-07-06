import { redirect } from "next/navigation"

import { getCurrentUser } from "@/features/auth/session"
import { AdminWorkspace } from "@/features/tourism/components/admin-workspace"
import { getTourismData } from "@/features/tourism/repository"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (user?.role !== "admin") {
    redirect("/login?next=/admin")
  }

  const tourismData = await getTourismData()

  return <AdminWorkspace initialData={tourismData} userEmail={user.email} />
}
