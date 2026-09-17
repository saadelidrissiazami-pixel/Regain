-- Regain — ressenti chiffré et réponses écrites en fin de séance bien-être.
-- La table garde une ligne par séance terminée : chaque ligne porte le ressenti du moment,
-- les réponses aux questions et la note libre, relus ensuite dans le journal et le suivi.

alter table public.wellbeing_sessions_completed
  add column if not exists mood smallint,
  add column if not exists reflections jsonb not null default '[]'::jsonb;

-- 1 = très difficile … 5 = très bien. Null pour les séances terminées avant cette version.
alter table public.wellbeing_sessions_completed
  drop constraint if exists wellbeing_sessions_completed_mood_check;
alter table public.wellbeing_sessions_completed
  add constraint wellbeing_sessions_completed_mood_check check (mood is null or mood between 1 and 5);

-- Le journal se lit du plus récent au plus ancien.
create index if not exists wellbeing_sessions_completed_user_date_idx
  on public.wellbeing_sessions_completed (user_id, completed_at desc);
