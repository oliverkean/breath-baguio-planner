# Setup Guide

This app runs without external provider keys, but these setup steps unlock the full portfolio stack.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Run validation checks with:

```bash
npm run lint
npm run test
npm run build
```

## Required For AI Itineraries

Create `.env.local` in the project root:

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.5
```

Without `OPENAI_API_KEY`, `/api/itinerary` uses the local rule-based planner.

## Admin Login And Roles

Admin login prefers Supabase Auth when Supabase Auth variables are configured:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
```

Create an auth user in Supabase, then grant the admin role from this project:

```bash
npm run db:grant-admin -- admin@example.com
```

If `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` are configured, you can bootstrap the configured admin user in one step:

```bash
npm run auth:bootstrap-admin
```

Use the service-role key only in local scripts or trusted server environments. Never expose it to the browser.

For local development without Supabase Auth, the app falls back to server-side credentials:

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password
SESSION_SECRET=replace_with_at_least_32_random_characters
```

Generate a local session secret with PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

The admin session is stored in a signed HTTP-only cookie. Supabase-backed admin requests re-check the persisted role in `user_roles`, so role removal is enforced before cookie expiry. Keep `SESSION_SECRET` server-side only.

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

Apply Supabase RLS policies with:

```bash
npm run db:apply-rls
```

The RLS policy set allows public reads of tourism data and authenticated admin writes. Runtime server writes still go through protected API routes; do not expose `DATABASE_URL`, `DIRECT_URL`, or service-role credentials to browser code.

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
4. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SESSION_SECRET` in Vercel Project Settings.
5. Deploy from `main`.

## Browser Icon

The branded favicon lives at `src/app/favicon.ico`. A preview PNG is available at `public/favicon-preview.png`.

Browsers cache favicons aggressively. If the old icon remains visible, hard refresh the tab or restart the local dev server and reopen the page.
