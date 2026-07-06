# Setup Guide

This app runs without external provider keys, but these setup steps unlock the full portfolio stack.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Required For AI Itineraries

Create `.env.local` in the project root:

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.5
```

Without `OPENAI_API_KEY`, `/api/itinerary` uses the local rule-based planner.

## Optional For Production Data

Supabase/Postgres:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=server_only_service_role_key
```

Use `docs/database-schema.sql` as the starting schema. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.

## Optional For Maps

Mapbox:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

The current MVP uses a lightweight route visualization. Add a dedicated map component before using real geocoding or route APIs.

## GitHub And Deployment

1. Push the branch to GitHub.
2. Import the repository in Vercel.
3. Add the same environment variables in Vercel Project Settings.
4. Deploy from `main`.

## Browser Icon

The branded favicon lives at `src/app/favicon.ico`. A preview PNG is available at `public/favicon-preview.png`.

Browsers cache favicons aggressively. If the old icon remains visible, hard refresh the tab or restart the local dev server and reopen the page.
