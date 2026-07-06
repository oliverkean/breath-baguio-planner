import { generateLocalItinerary, normalizeItineraryRequest } from "@/features/tourism/itinerary"
import { getTourismData } from "@/features/tourism/repository"
import type { ItineraryRequest, ItineraryResult, TourismData } from "@/features/tourism/types"

export const runtime = "nodejs"

type OpenAIResponse = {
  output_text?: string
  output?: Array<{
    content?: Array<{
      text?: string
      type?: string
    }>
  }>
}

export async function POST(request: Request) {
  let body: Partial<ItineraryRequest>

  try {
    body = (await request.json()) as Partial<ItineraryRequest>
  } catch {
    return Response.json({ error: "Invalid JSON request body." }, { status: 400 })
  }

  const itineraryRequest = normalizeItineraryRequest(body)
  const tourismData = await getTourismData()
  const fallback = generateLocalItinerary(itineraryRequest, tourismData)

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({
      ...fallback,
      assumptions: [
        ...fallback.assumptions,
        "OPENAI_API_KEY is not configured, so this response uses local planning rules.",
      ],
    })
  }

  try {
    const generated = await generateOpenAIItinerary(itineraryRequest, fallback, tourismData)

    return Response.json(generated)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown OpenAI generation failure."

    return Response.json({
      ...fallback,
      assumptions: [...fallback.assumptions, `AI generation failed: ${message}`],
    })
  }
}

async function generateOpenAIItinerary(
  request: ItineraryRequest,
  fallback: ItineraryResult,
  tourismData: TourismData
): Promise<ItineraryResult> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions:
        "You are a sustainable tourism planner for Baguio City. Return only valid JSON matching the provided fallback structure. Keep recommendations conservative, capacity-aware, low-waste, and car-light. Do not claim live city data.",
      input: JSON.stringify({
        request,
        attractions: tourismData.attractions,
        events: tourismData.events,
        advisories: tourismData.advisories,
        fallback,
      }),
      text: {
        format: { type: "json_object" },
        verbosity: "low",
      },
      store: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as OpenAIResponse
  const text = extractResponseText(payload)

  if (!text) {
    throw new Error("OpenAI response did not include text output.")
  }

  const parsed = JSON.parse(text) as ItineraryResult

  return {
    ...fallback,
    ...parsed,
    source: "openai",
    assumptions: [
      ...(parsed.assumptions?.length ? parsed.assumptions : fallback.assumptions),
      "Generated with OpenAI using configured seed data, not live VISITA or traffic feeds.",
    ],
  }
}

function extractResponseText(payload: OpenAIResponse) {
  if (payload.output_text) {
    return payload.output_text
  }

  return payload.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n")
}
