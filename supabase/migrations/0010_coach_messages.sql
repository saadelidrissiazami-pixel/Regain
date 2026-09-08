-- Regain — historique de conversation avec le coach IA (V2)

create table public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.coach_messages enable row level security;

create policy "own coach messages" on public.coach_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, delete on public.coach_messages to authenticated;
