import { PlannerWorkspace } from "@/features/tourism/components/planner-workspace"
import { getTourismData } from "@/features/tourism/repository"

export const dynamic = "force-dynamic"

export default async function Home() {
  const tourismData = await getTourismData()

  return <PlannerWorkspace initialData={tourismData} />
}
