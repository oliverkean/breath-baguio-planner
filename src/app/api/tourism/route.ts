import { getTourismData } from "@/features/tourism/repository"

export const dynamic = "force-dynamic"

export async function GET() {
  const tourismData = await getTourismData()

  return Response.json(tourismData)
}
