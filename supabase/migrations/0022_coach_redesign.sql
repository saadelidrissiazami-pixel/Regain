-- Regain — refonte « coach » : ce que l'app demande désormais à l'accueil et au questionnaire forme,
-- et le journal des séances de musculation faites dans le lecteur.
-- Rejouable. Tant qu'elle n'est pas appliquée, l'app masque simplement ces informations.

-- Sommeil habituel (onboarding / « Mes objectifs »), en minutes : 450 = 7 h 30.
alter table public.user_preferences
  add column if not exists typical_sleep_minutes smallint
  check (typical_sleep_minutes between 180 and 780);

-- Quand l'utilisateur s'entraîne : créneau et jours (0 = lundi … 6 = dimanche, comme availability).
alter table public.fitness_profiles
  add column if not exists training_slot text check (training_slot in ('matin', 'apres_midi', 'soir'));
alter table public.fitness_profiles
  add column if not exists training_days smallint[];

-- Une ligne par séance terminée dans le lecteur d'entraînement.
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid references public.fitness_plans (id) on delete set null,
  session_index int not null check (session_index between 0 and 13),
  focus text,
  duration_minutes int check (duration_minutes between 1 and 300),
  completed_at timestamptz not null default now()
);

create index if not exists workout_logs_user_completed_idx on public.workout_logs (user_id, completed_at desc);

alter table public.workout_logs enable row level security;

drop policy if exists "own workout logs" on public.workout_logs;
create policy "own workout logs" on public.workout_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Pas de default privileges depuis 0018 : GRANT explicites.
grant select, insert, delete on public.workout_logs to authenticated;
