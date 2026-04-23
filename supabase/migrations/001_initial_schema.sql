-- ============================================================
-- KabaddiHub — Full Database Migration
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. PROFILES table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  role text not null default 'USER' check (role in ('USER', 'ORGANISER', 'SUPER_ADMIN')),
  tenant_id uuid,
  phone text,
  city text,
  position text check (position in ('RAIDER', 'DEFENDER', 'ALL_ROUNDER', null)),
  height text,
  weight text,
  pan_card text,
  aadhar_card text,
  photo_url text,
  followed_teams text[] default '{}',
  joined_at timestamptz default now()
);

-- 2. TENANTS table (Organisations/Franchises)
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  banner_url text,
  primary_color text not null default '#f97316',
  secondary_color text not null default '#0f172a',
  subscription_tier text not null default 'FREE' check (subscription_tier in ('FREE', 'PRO', 'ENTERPRISE')),
  admin_email text,
  admin_password text,
  city text,
  phone text,
  email text,
  status text not null default 'ENABLED' check (status in ('ENABLED', 'DISABLED')),
  created_at timestamptz default now()
);

-- 3. TEAMS table
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  name text not null,
  short_name text not null,
  primary_color text default '#f97316',
  secondary_color text default '#0f172a',
  city text,
  created_at timestamptz default now()
);

-- 4. ATHLETES table (Global Player Pool)
create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  number text not null default '00',
  phone text,
  email text,
  role text not null default 'RAIDER' check (role in ('RAIDER', 'DEFENDER', 'ALL_ROUNDER')),
  weight text,
  height text,
  city text,
  pan text,
  aadhar text,
  photo text,
  kyc_status text not null default 'PENDING' check (kyc_status in ('PENDING', 'VERIFIED', 'REJECTED')),
  status text not null default 'ENABLED' check (status in ('ENABLED', 'DISABLED')),
  raid_points int4 not null default 0,
  tackle_points int4 not null default 0,
  matches_played int4 not null default 0,
  super_raids int4 not null default 0,
  super_tackles int4 not null default 0,
  super_tens int4 not null default 0,
  high_fives int4 not null default 0,
  created_at timestamptz default now()
);

-- 5. TEAM_ATHLETES junction table
create table if not exists public.team_athletes (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  athlete_id uuid references public.athletes(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(team_id, athlete_id)
);

-- 6. LIVE_MATCHES table (already exists but ensure it does)
create table if not exists public.live_matches (
  id text primary key,
  state jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.tenants enable row level security;
alter table public.teams enable row level security;
alter table public.athletes enable row level security;
alter table public.team_athletes enable row level security;
alter table public.live_matches enable row level security;

-- PROFILES policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Service role has full access to profiles" on public.profiles for all using (true) with check (true);

-- TENANTS policies (public read, service role write)
create policy "Anyone can view enabled tenants" on public.tenants for select using (status = 'ENABLED');
create policy "Service role manages tenants" on public.tenants for all using (true) with check (true);

-- TEAMS policies
create policy "Anyone can view teams" on public.teams for select using (true);
create policy "Service role manages teams" on public.teams for all using (true) with check (true);

-- ATHLETES policies
create policy "Anyone can view active athletes" on public.athletes for select using (status = 'ENABLED');
create policy "Service role manages athletes" on public.athletes for all using (true) with check (true);

-- TEAM_ATHLETES policies
create policy "Anyone can view team rosters" on public.team_athletes for select using (true);
create policy "Service role manages team rosters" on public.team_athletes for all using (true) with check (true);

-- LIVE_MATCHES policies
create policy "Anyone can view live matches" on public.live_matches for select using (true);
create policy "Service role manages live matches" on public.live_matches for all using (true) with check (true);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role, photo_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'USER'),
    coalesce(new.raw_user_meta_data->>'photo_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
