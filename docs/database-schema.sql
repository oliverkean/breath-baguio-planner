create type crowd_level as enum ('low', 'moderate', 'high', 'critical');
create type advisory_severity as enum ('info', 'warning', 'urgent');
create type user_role as enum ('admin', 'traveler');

create table user_roles (
  user_id uuid primary key,
  role user_role not null default 'traveler',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table attractions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  district text not null,
  location text not null,
  opening_hours text not null,
  tags text[] not null default '{}',
  baseline_crowd crowd_level not null default 'moderate',
  car_free_hint text not null,
  waste_reminder text not null,
  duration_hours numeric(4, 2) not null default 2,
  source_name text,
  source_url text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tourism_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  starts_on date not null,
  ends_on date not null,
  impact crowd_level not null default 'high',
  notes text not null default '',
  source_name text,
  source_url text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tourism_events_date_range check (ends_on >= starts_on)
);

create table advisories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  severity advisory_severity not null default 'info',
  area text not null,
  message text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  source_name text,
  source_url text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint advisories_date_range check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create table crowd_rules (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  condition text not null,
  score_impact integer not null,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crowd_rules_score_range check (score_impact between -100 and 100)
);

create index attractions_tags_idx on attractions using gin (tags);
create index attractions_created_at_name_idx on attractions (created_at, name);
create index tourism_events_dates_idx on tourism_events (starts_on, ends_on);
create index tourism_events_starts_on_name_idx on tourism_events (starts_on, name);
create index advisories_area_idx on advisories (area);
create index advisories_created_at_title_idx on advisories (created_at, title);
create index crowd_rules_created_at_label_idx on crowd_rules (created_at, label);
create index user_roles_role_idx on user_roles (role);

alter table user_roles enable row level security;
alter table attractions enable row level security;
alter table tourism_events enable row level security;
alter table advisories enable row level security;
alter table crowd_rules enable row level security;

create policy "Public can read attractions" on attractions for select using (true);
create policy "Public can read events" on tourism_events for select using (true);
create policy "Public can read advisories" on advisories for select using (true);
create policy "Public can read crowd rules" on crowd_rules for select using (true);

-- Apply the full Supabase Auth role policies from drizzle/rls.sql:
-- npm run db:apply-rls
-- Admin writes require authenticated users with an admin role in public.user_roles.
-- Keep database URLs and service-role credentials server-side only.
