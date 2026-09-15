-- Regain — coach forme (Premium) : profil sportif, programmes générés par l'agent IA, bilans hebdo
--
-- Les calories et macros (fitness_plans.targets) sont calculées en code avec une formule
-- reconnue et un plancher de sécurité ; l'agent IA compose séances et menus DANS ces limites.
-- Pas de default privileges depuis 0018 : chaque table reçoit ses GRANT explicites.

create table public.fitness_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  goals text[] not null default '{}',
  sex text not null check (sex in ('femme', 'homme')),
  birth_year int not null check (birth_year between 1900 and 2100),
  height_cm int not null check (height_cm between 120 and 230),
  weight_kg numeric(5, 1) not null check (weight_kg between 35 and 250),
  activity_level text not null check (activity_level in ('sedentaire', 'leger', 'modere', 'actif')),
  experience text not null check (experience in ('debutant', 'intermediaire', 'confirme')),
  equipment text not null check (equipment in ('salle', 'halteres_maison', 'poids_du_corps')),
  days_per_week int not null check (days_per_week between 1 and 6),
  session_minutes int not null check (session_minutes between 20 and 120),
  diet text not null check (diet in ('omnivore', 'vegetarien', 'vegan', 'pescetarien', 'halal')),
  allergies text,
  health_notes text,
  updated_at timestamptz not null default now()
);

create table public.fitness_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  targets jsonb not null,
  program jsonb not null,
  meals jsonb not null,
  shopping_list jsonb not null,
  coach_notes text,
  created_at timestamptz not null default now()
);

create index fitness_plans_user_created_idx on public.fitness_plans (user_id, created_at desc);

create table public.fitness_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  weight_kg numeric(5, 1) check (weight_kg between 35 and 250),
  sessions_done int not null check (sessions_done between 0 and 7),
  energy int not null check (energy between 1 and 5),
  note text,
  created_at timestamptz not null default now()
);

create index fitness_checkins_user_created_idx on public.fitness_checkins (user_id, created_at desc);

alter table public.fitness_profiles enable row level security;
alter table public.fitness_plans enable row level security;
alter table public.fitness_checkins enable row level security;

create policy "own fitness profile" on public.fitness_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own fitness plans" on public.fitness_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own fitness checkins" on public.fitness_checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.fitness_profiles to authenticated;
-- Les programmes sont écrits par l'Edge Function avec le JWT de l'utilisateur (RLS appliquée).
grant select, insert, delete on public.fitness_plans to authenticated;
grant select, insert, delete on public.fitness_checkins to authenticated;
