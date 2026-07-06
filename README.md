# Breathe Baguio Planner

Sustainable tourism planner for Baguio City. The app helps visitors build responsible itineraries with crowd scoring, car-light routing, low-waste reminders, attraction cards, and a protected admin workspace for capacity-related tourism data.

## Why This Exists

Baguio has an official tourism portal, [VISITA](https://visita.baguio.gov.ph/), for tourism information and verified listings. The city is also moving toward circular tourism because tourism affects waste volume, resource use, visitor flows, and carrying capacity. This portfolio project turns that policy problem into a practical planning tool.

## Current App

- Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui.
- Tourist planner for trip length, date, budget, transport mode, interests, and free-form notes.
- Rule-based crowd score for weekday, weekend, configured events, and private-car pressure.
- Optional itinerary service through `/api/itinerary` when `OPENAI_API_KEY` is configured.
- Saved planning rules are used when provider keys are not configured.
- Attraction cards with location, opening hours, tags, car-free guidance, and waste reminders.
- Protected admin dashboard for adding attractions, events, advisories, and crowd rules.
- Supabase Postgres persistence through Drizzle ORM, with Supabase Auth role checks for admins.
- Nullable audit fields for Supabase-backed admin-created tourism records.
- Source attribution fields for attractions, holiday/event pressure windows, and advisories.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Run local checks with:

```bash
npm run lint
npm run test
npm run build
```

## Environment

Create `.env.local` when using provider-backed features:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
SESSION_SECRET=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

The app works without provider variables by using starter records and saved planning rules. Admin login prefers Supabase Auth when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured, then uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` only for local development.

For provider setup details, see `docs/setup.md`.

Database setup commands:

```bash
npm run db:push
npm run db:seed
npm run db:apply-rls
```

After creating a Supabase Auth user, grant admin access with:

```bash
npm run db:grant-admin -- admin@example.com
```

Or create/grant the configured `.env.local` admin user in one step:

```bash
npm run auth:bootstrap-admin
```

## Architecture

See `docs/architecture.md`.

Backend thinking order used here:

1. Domain: tourism data, attractions, events, advisories, crowd rules.
2. API contract: `POST /api/itinerary`, `GET /api/tourism`.
3. Validation: normalize itinerary requests and clamp unsafe values.
4. Service: deterministic local itinerary generator.
5. Data access: Drizzle repository backed by Supabase Postgres with starter-record backup.
6. Side effects: provider call isolated to the route handler.
7. Edge cases: missing API key, invalid JSON, failed provider response.
8. Observability: route returns assumptions explaining planning source.
9. Tests: Vitest coverage exists for crowd scoring, login rate limiting, login API behavior, and admin write authorization.

## Data Sources And References

Data-source decisions and map/geocoding constraints are documented in `docs/data-sources.md`.

- [Baguio VISITA official portal](https://visita.baguio.gov.ph/)
- [UNDP Philippines: Baguio circular tourism](https://www.undp.org/philippines/press-releases/baguio-city-advances-circular-tourism-reduce-waste-manage-growth-and-build-resilience)
- [UP CIDS policy brief PDF on Baguio carrying capacity](https://cids.up.edu.ph/wp-content/uploads/2025/06/Recommendations-on-Baguio-Citys-Carrying-Capacity.pdf)
- [OpenAI Responses API text guide](https://developers.openai.com/api/docs/guides/text)
- [OpenAI Responses API reference](https://developers.openai.com/api/reference/responses/overview/)

## Production Gaps

- Replace curated source-backed starter records with an approved VISITA/city-maintained feed when one is available.
- Add Mapbox or Google Maps for actual route visualization.
- Add Philippine holiday and Panagbenga calendars from maintained sources.
- Add durable distributed rate limiting and structured logging for itinerary planning.
- Expand tests around itinerary planning, provider response validation, and full authenticated admin workflows.
