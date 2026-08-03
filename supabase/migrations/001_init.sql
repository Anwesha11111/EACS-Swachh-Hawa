-- ─────────────────────────────────────────────────────────────────────────────
-- Swachh Hawa · Supabase Phase-4 Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- Or via CLI: supabase db push
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable the pgcrypto extension (needed for gen_random_uuid)
create extension if not exists "pgcrypto";

-- ── 1. Citizen Complaints ─────────────────────────────────────────────────────
create table if not exists public.complaints (
  id          uuid        primary key default gen_random_uuid(),
  citizen     text,                           -- optional, anonymous by default
  type        text        not null,
  location    text        not null,
  description text,
  city        text,
  verified    boolean     not null default false,
  status      text        not null default 'Pending Verification',
  correlation text,                           -- sensor correlation note
  dossier     text,                           -- enforcement dossier ID if any
  created_at  timestamptz not null default now()
);

-- Indices for common queries
create index if not exists complaints_city_idx        on public.complaints (city);
create index if not exists complaints_status_idx      on public.complaints (status);
create index if not exists complaints_created_at_idx  on public.complaints (created_at desc);

-- RLS: public can insert (anonymous complaints); only service-role can read
alter table public.complaints enable row level security;
create policy "Anyone can submit a complaint"
  on public.complaints for insert
  with check (true);
create policy "Service-role reads all"
  on public.complaints for select
  using (auth.role() = 'service_role');

-- ── 2. User Settings ──────────────────────────────────────────────────────────
create table if not exists public.user_settings (
  user_email         text        primary key,
  alert_threshold    int         not null default 200,
  notif_email        boolean     not null default true,
  notif_sms          boolean     not null default false,
  notif_push         boolean     not null default true,
  locale             text        not null default 'en-IN',
  pm25_threshold     int         not null default 60,
  no2_threshold      int         not null default 100,
  so2_threshold      int         not null default 80,
  updated_at         timestamptz not null default now()
);

-- RLS: each user manages their own row (via service-role on server)
alter table public.user_settings enable row level security;
create policy "Service-role manages settings"
  on public.user_settings for all
  using (auth.role() = 'service_role');

-- ── 3. AirGPT Chat History ────────────────────────────────────────────────────
create table if not exists public.chat_history (
  id          uuid        primary key default gen_random_uuid(),
  session_key text        not null,   -- user email OR anonymous session token
  role        text        not null check (role in ('user', 'assistant')),
  content     text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists chat_history_session_idx     on public.chat_history (session_key, created_at);
create index if not exists chat_history_created_at_idx  on public.chat_history (created_at desc);

-- RLS: service-role only (all reads/writes go through server functions)
alter table public.chat_history enable row level security;
create policy "Service-role manages chat"
  on public.chat_history for all
  using (auth.role() = 'service_role');

-- ── 4. Notification Read State ────────────────────────────────────────────────
create table if not exists public.notification_reads (
  user_email       text        not null,
  notification_id  text        not null,
  read_at          timestamptz not null default now(),
  primary key (user_email, notification_id)
);

create index if not exists notif_reads_user_idx on public.notification_reads (user_email);

alter table public.notification_reads enable row level security;
create policy "Service-role manages notification reads"
  on public.notification_reads for all
  using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- Done. Verify with:
--   select table_name from information_schema.tables
--   where table_schema = 'public'
--   order by table_name;
-- ─────────────────────────────────────────────────────────────────────────────
