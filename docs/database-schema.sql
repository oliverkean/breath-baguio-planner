create type crowd_level as enum ('low', 'moderate', 'high', 'critical');
create type advisory_severity as enum ('info', 'warning', 'urgent');

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint advisories_date_range check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create table crowd_rules (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  condition text not null,
  score_impact integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crowd_rules_score_range check (score_impact between -100 and 100)
);

create index attractions_tags_idx on attractions using gin (tags);
create index tourism_events_dates_idx on tourism_events (starts_on, ends_on);
create index advisories_area_idx on advisories (area);

alter table attractions enable row level security;
alter table tourism_events enable row level security;
alter table advisories enable row level security;
alter table crowd_rules enable row level security;

create policy "Public can read attractions" on attractions for select using (true);
create policy "Public can read events" on tourism_events for select using (true);
create policy "Public can read advisories" on advisories for select using (true);
create policy "Public can read crowd rules" on crowd_rules for select using (true);

-- Production admin writes should require authenticated users with an admin role.
-- Keep service-role mutations on the server only.
