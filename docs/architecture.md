# Architecture

## Goal

Build a clean MVP that demonstrates full-stack product thinking without pretending sample data is live official city data.

## Current Behavior

The app is a single Next.js App Router application. The home page renders a client workspace with seed tourism data. The itinerary API can call OpenAI through the Responses API when `OPENAI_API_KEY` is set, otherwise it returns a deterministic local-rule itinerary.

## Modules

- `src/app/page.tsx`: server entry point that injects seed tourism data.
- `src/app/api/itinerary/route.ts`: server-only itinerary generation endpoint.
- `src/app/api/tourism/route.ts`: read-only tourism seed data endpoint.
- `src/features/tourism/types.ts`: domain contract.
- `src/features/tourism/data.ts`: MVP seed data and reminders.
- `src/features/tourism/crowd.ts`: crowd scoring and date utilities.
- `src/features/tourism/itinerary.ts`: deterministic itinerary service.
- `src/features/tourism/components/planner-workspace.tsx`: interactive tourist and admin workspace.
- `src/components/ui/*`: shadcn/ui source components.

## API Contracts

### `POST /api/itinerary`

Request:

```ts
{
  days: number
  budget: "low" | "mid" | "premium"
  transportMode: "no-private-car" | "private-car" | "mixed"
  startDate: string
  interests: string[]
  notes: string
}
```

Response:

```ts
{
  source: "local-rules" | "openai"
  title: string
  assumptions: string[]
  carFreeSuggestions: string[]
  ecoReminders: string[]
  days: Array<{
    day: number
    date: string
    crowdLevel: "low" | "moderate" | "high" | "critical"
    crowdScore: number
    summary: string
    stops: Array<{
      time: string
      attractionId: string
      title: string
      district: string
      guidance: string
    }>
  }>
}
```

### `GET /api/tourism`

Returns seed attractions, events, advisories, and crowd rules.

## Constraints And Risks

- Seed attractions and advisories are demo data. Do not treat them as verified official records.
- Crowd score is a planning heuristic, not a city-approved capacity model.
- Admin changes are local component state and reset on refresh.
- OpenAI output is constrained by prompt and JSON mode, but still requires server-side validation before production.
- Map visuals are illustrative. Production route planning needs a proper maps provider and transport data.

## Provider Boundaries

- OpenAI is isolated to `src/app/api/itinerary/route.ts`.
- Supabase is not imported yet. The schema is prepared so persistence can be added without rewiring UI contracts.
- Mapbox/Google Maps are not imported yet. Use a dedicated map component later rather than mixing provider code into planner state.

## Follow-Up Design

1. Add repository interfaces for attractions, events, advisories, and crowd rules.
2. Implement Supabase repository and service-role-only admin mutations.
3. Validate itinerary requests with a schema library such as Zod.
4. Validate AI JSON against the same response contract.
5. Add auth and role checks before enabling persistent admin writes.
6. Add telemetry for fallback rate, generation latency, and invalid AI output.
