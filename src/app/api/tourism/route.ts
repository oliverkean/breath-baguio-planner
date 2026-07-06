import { tourismData } from "@/features/tourism/data"

export const dynamic = "force-static"

export async function GET() {
  return Response.json(tourismData)
}
