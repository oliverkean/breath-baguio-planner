# Architecture

## Goal

Build a clean trip-planning app that demonstrates full-stack product thinking without pretending curated starter records are live city data.

## Current Behavior

The app is a single Next.js App Router application. The home page renders a client workspace with tourism data loaded from Supabase Postgres through Drizzle. When the database is unavailable, starter records keep the planner usable. The itinerary API can call a provider through the Responses API when `OPENAI_API_KEY` is set, otherwise it returns a deterministic planning-rules itinerary.

## Modules

- `src/app/page.tsx`: server entry point that injects tourism data.
- `src/app/api/itinerary/route.ts`: server-only itinerary planning endpoint.
- `src/app/api/tourism/route.ts`: read-only tourism data endpoint.
- `src/features/tourism/types.ts`: domain contract.
- `src/features/tourism/data.ts`: starter records and reminders.
- `src/features/tourism/crowd.ts`: crowd scoring and date utilities.
- `src/features/tourism/itinerary.ts`: deterministic itinerary service.
- `src/features/tourism/repository.ts`: Drizzle-backed Supabase Postgres repository with starter-record backup.
- `src/db/schema.ts`: Drizzle table and enum definitions.
- `src/features/tourism/components/planner-workspace.tsx`: public tourist planning workspace.
- `src/features/tourism/components/admin-workspace.tsx`: protected admin management surface.
- `src/features/auth/session.ts`: signed cookie session, Supabase Auth login, and admin role guard.
- `src/features/auth/repository.ts`: persisted user role lookups.
- `src/lib/supabase-auth.ts`: server-only Supabase Auth client factory.
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

Returns attractions, events, advisories, and crowd rules.

## Constraints And Risks

- Starter attractions and advisories are curated records. Do not treat them as live official city records.
- Crowd score is a planning heuristic, not a city-approved capacity model.
- Admin writes require an `admin` session and persist to Supabase Postgres. Supabase-backed admin sessions re-check `user_roles` during protected access.
- Admin access is intentionally not linked from the public tourist navigation. Staff enter through `/admin`, which redirects unauthenticated users to `/login?next=/admin`.
- Supabase-backed admin writes populate nullable `created_by` and `updated_by` audit columns. Local env sessions do not have a UUID actor and leave those fields empty.
- Attractions, events, and advisories carry nullable source name/URL fields. VISITA is treated as the official portal, but records should be curated through admin workflows or an approved feed rather than scraped from undocumented endpoints.
- Provider output is constrained by prompt and JSON mode, but still requires server-side validation before production.
- Map visuals are illustrative. Production route planning needs a proper maps provider and transport data.
- Login rate limiting is in-memory and best effort. Use a durable shared store before scaling across server instances.

## Provider Boundaries

- Provider itinerary calls are isolated to `src/app/api/itinerary/route.ts`.
- Supabase Postgres is accessed through Drizzle ORM on the server using `DATABASE_URL`.
- Supabase Auth is used server-side for password verification. Role authorization is stored in `public.user_roles`.
- RLS policies in `drizzle/rls.sql` allow public reads and authenticated admin writes for Supabase client access.
- Mapbox/Google Maps are not imported yet. Use a dedicated map component later rather than mixing provider code into planner state.

## Follow-Up Design

1. Validate itinerary requests with a schema library such as Zod.
2. Validate provider JSON against the same response contract.
3. Add telemetry for planning source, request latency, and invalid provider output.
