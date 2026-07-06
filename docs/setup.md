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

## Admin Login

The MVP uses server-side credentials for the protected `/admin` route:

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password
SESSION_SECRET=replace_with_at_least_32_random_characters
```

Generate a local session secret with PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

The admin session is stored in a signed HTTP-only cookie. This protects the admin page and admin write APIs. For production, replace this with Supabase Auth and role records.

## Supabase Postgres And Drizzle

The app uses Drizzle ORM against Supabase Postgres. Use the transaction-mode pooler for runtime reads/writes and the session-mode pooler for schema operations.

```bash
DATABASE_URL=your_transaction_pooler_url
DIRECT_URL=your_session_pooler_url
```

Create or update the schema with:

```bash
npm run db:push
```

Seed the starter Baguio tourism data with:

```bash
npm run db:seed
```

You can also run the SQL in `docs/database-schema.sql` manually from the Supabase SQL Editor. Keep `DATABASE_URL` and `DIRECT_URL` server-side only. Do not prefix them with `NEXT_PUBLIC_`.

## Optional For Maps

Mapbox:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

The current MVP uses a lightweight route visualization. Add a dedicated map component before using real geocoding or route APIs.

## GitHub And Deployment

1. Push the branch to GitHub.
2. Import the repository in Vercel.
3. Add `DATABASE_URL`, `DIRECT_URL`, and optional provider keys in Vercel Project Settings.
4. Add `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_SECRET` in Vercel Project Settings.
5. Deploy from `main`.

## Browser Icon

The branded favicon lives at `src/app/favicon.ico`. A preview PNG is available at `public/favicon-preview.png`.

Browsers cache favicons aggressively. If the old icon remains visible, hard refresh the tab or restart the local dev server and reopen the page.
