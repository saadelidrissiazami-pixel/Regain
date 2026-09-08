-- Regain — schéma initial (MVP : planning + bien-être)
-- À appliquer sur un projet Supabase (région UE recommandée) via `supabase db push`
-- ou en collant ce fichier dans l'éditeur SQL du dashboard Supabase.

create extension if not exists "pgcrypto";

-- Profil utilisateur (étend auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  primary_goals text[] not null default '{}',
  category_weights jsonb not null default '{}',
  typical_energy_by_slot jsonb not null default '{}',
  budget_level text not null default 'modere' check (budget_level in ('gratuit', 'modere', 'confortable')),
  quiet_hours jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text,
  recurrence_rule text,
  is_recurring boolean not null default true,
  specific_date date,
  created_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null,
  target_frequency_per_week int not null default 1,
  status text not null default 'actif' check (status in ('actif', 'en_pause', 'atteint')),
  created_at timestamptz not null default now()
);

create table public.activities_catalog (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  duration_minutes int not null,
  energy_required text not null check (energy_required in ('bas', 'moyen', 'eleve')),
  indoor_outdoor text check (indoor_outdoor in ('indoor', 'outdoor', 'indifferent')),
  cost_level text not null default 'gratuit' check (cost_level in ('gratuit', 'faible', 'modere')),
  instructions text,
  tags text[] not null default '{}'
);

create table public.planned_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  activity_id uuid references public.activities_catalog (id),
  week_start_date date not null,
  scheduled_at timestamptz,
  status text not null default 'propose' check (status in ('propose', 'confirme', 'realise', 'saute', 'replanifie')),
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  planned_activity_id uuid references public.planned_activities (id) on delete set null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  completed_at timestamptz not null default now(),
  felt_energy_after int check (felt_energy_after between 1 and 5),
  note text
);

create table public.energy_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  checkin_at timestamptz not null default now(),
  energy_level int not null check (energy_level between 1 and 5),
  mood_tag text
);

create table public.wellbeing_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  session_count int not null default 1,
  premium_only boolean not null default false
);

create table public.wellbeing_sessions_completed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  program_id uuid not null references public.wellbeing_programs (id) on delete cascade,
  session_index int not null,
  completed_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  plan text not null default 'gratuit' check (plan in ('gratuit', 'premium_mensuel', 'premium_annuel')),
  status text not null default 'active',
  current_period_end timestamptz,
  revenuecat_customer_id text
);

-- Row Level Security : chaque utilisateur ne voit et ne modifie que ses propres données.
-- Le catalogue d'activités et les programmes bien-être sont en lecture publique (contenu éditorial partagé).

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.availability_slots enable row level security;
alter table public.goals enable row level security;
alter table public.activities_catalog enable row level security;
alter table public.planned_activities enable row level security;
alter table public.activity_logs enable row level security;
alter table public.energy_checkins enable row level security;
alter table public.wellbeing_programs enable row level security;
alter table public.wellbeing_sessions_completed enable row level security;
alter table public.subscriptions enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own preferences" on public.user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own availability" on public.availability_slots for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own goals" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own planned activities" on public.planned_activities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own logs" on public.activity_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own checkins" on public.energy_checkins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sessions completed" on public.wellbeing_sessions_completed for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own subscription" on public.subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "public read activities catalog" on public.activities_catalog for select using (true);
create policy "public read wellbeing programs" on public.wellbeing_programs for select using (true);
