import { PlannerWorkspace } from "@/features/tourism/components/planner-workspace"
import { tourismData } from "@/features/tourism/data"

export default function Home() {
  return <PlannerWorkspace initialData={tourismData} />
}
