-- Regain — ce qui a été mangé, en face de la cible calorique déjà calculée.
--
-- La cible vit dans le code (features/fitness/nutrition.ts la recalcule depuis le profil) et n'a
-- donc pas besoin d'être stockée. Ce qui manquait, c'est l'autre moitié : le consommé. Une ligne
-- par aliment ajouté, rattachée à une journée, jamais à un repas — personne ne mange en trois
-- blocs réguliers, et exiger « petit-déjeuner / déjeuner / dîner » ferait mentir la saisie.

create table public.nutrition_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- Le jour auquel l'aliment compte, pas l'instant de la saisie : on note souvent le soir ce
  -- qu'on a mangé à midi, et created_at basculerait au lendemain après minuit.
  entry_date date not null,
  label text not null check (length(trim(label)) > 0),
  calories integer not null check (calories >= 0 and calories <= 10000),
  -- Les protéines sont la seule macro affichée à côté des calories ; les autres ne sont pas
  -- demandées à la saisie et resteraient vides.
  protein_g integer check (protein_g is null or (protein_g >= 0 and protein_g <= 500)),
  -- 'photo' quand l'estimation vient d'une image : l'écran le dit, parce qu'une estimation
  -- automatique se trompe et doit rester corrigeable en connaissance de cause.
  source text not null default 'manual' check (source in ('manual', 'photo')),
  created_at timestamptz not null default now()
);

alter table public.nutrition_entries enable row level security;

create policy "own nutrition entries" on public.nutrition_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.nutrition_entries to authenticated;

-- La journée se lit d'un coup, et le suivi relit les jours récents.
create index if not exists nutrition_entries_user_date_idx
  on public.nutrition_entries (user_id, entry_date desc);
