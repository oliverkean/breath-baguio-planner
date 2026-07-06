# Breathe Baguio Planner

AI-assisted sustainable tourism planner for Baguio City. The app helps tourists build responsible itineraries with crowd scoring, car-light routing, eco reminders, attraction cards, and an admin dashboard for capacity-related tourism data.

## Why This Exists

Baguio has an official tourism portal, [VISITA](https://visita.baguio.gov.ph/), for tourism information and verified listings. The city is also moving toward circular tourism because tourism affects waste volume, resource use, visitor flows, and carrying capacity. This portfolio project turns that policy problem into a practical planning tool.

## Current MVP

- Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui.
- Tourist planner for trip length, date, budget, transport mode, interests, and free-form notes.
- Rule-based crowd score for weekday, weekend, configured events, and private-car pressure.
- OpenAI-backed `/api/itinerary` route when `OPENAI_API_KEY` is configured.
- Deterministic local itinerary fallback when OpenAI is unavailable.
- Attraction cards with location, opening hours, tags, car-free guidance, and waste reminders.
- Admin dashboard for adding attractions, events, advisories, and crowd rules to local MVP state.
- Supabase-ready schema documented in `docs/database-schema.sql`.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Create `.env.local` when using provider-backed features:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The app works without these variables by using seed data and local rules.

For provider setup details, see `docs/setup.md`.

## Architecture

See `docs/architecture.md`.

Backend thinking order used here:

1. Domain: tourism data, attractions, events, advisories, crowd rules.
2. API contract: `POST /api/itinerary`, `GET /api/tourism`.
3. Validation: normalize itinerary requests and clamp unsafe values.
4. Service: deterministic local itinerary generator.
5. Data access: seed repository now, Supabase schema prepared.
6. Side effects: OpenAI call isolated to the route handler.
7. Edge cases: missing API key, invalid JSON, failed OpenAI response.
8. Observability: route returns assumptions explaining source/fallback.
9. Tests: current validation is build/lint plus manual UI checks; add unit tests before production use.

## Data Sources And References

- [Baguio VISITA official portal](https://visita.baguio.gov.ph/)
- [UNDP Philippines: Baguio circular tourism](https://www.undp.org/philippines/press-releases/baguio-city-advances-circular-tourism-reduce-waste-manage-growth-and-build-resilience)
- [UP CIDS policy brief PDF on Baguio carrying capacity](https://cids.up.edu.ph/wp-content/uploads/2025/06/Recommendations-on-Baguio-Citys-Carrying-Capacity.pdf)
- [OpenAI Responses API text generation guide](https://developers.openai.com/api/docs/guides/text)
- [OpenAI Responses API reference](https://developers.openai.com/api/reference/responses/overview/)

## Production Gaps

- Replace seed data with verified VISITA/city tourism data or an approved city-maintained dataset.
- Add Supabase Auth and role-based admin permissions.
- Persist admin changes in Postgres with audit fields.
- Add Mapbox or Google Maps for actual route visualization.
- Add Philippine holiday and Panagbenga calendars from maintained sources.
- Add rate limiting and structured logging for itinerary generation.
- Add unit tests for crowd scoring and integration tests for route handlers.
