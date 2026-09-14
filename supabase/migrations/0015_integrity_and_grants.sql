-- Regain — intégrité des données de référence et resserrage des privilèges
--
-- 1. Rejouer les migrations de contenu (0005/0007/0008/0013) dupliquait le
--    catalogue : elles sont désormais idempotentes, ce fichier ajoute les
--    contraintes correspondantes sur les bases déjà créées (et nettoie les
--    doublons éventuellement présents).
-- 2. `alter default privileges` posé en 0002 ouvrait automatiquement toute
--    future table de `public` en lecture/écriture, y compris celles où l'on
--    oublierait d'activer RLS. On revient à des GRANT explicites par table.

-- 1a. Doublons du catalogue : on garde la ligne la plus ancienne et on y
--     repointe les plannings qui référençaient un doublon.
with ranked as (
  select id, title, row_number() over (partition by title order by id) as rn
    from public.activities_catalog
)
update public.planned_activities pa
   set activity_id = keep.id
  from ranked dup
  join ranked keep on keep.title = dup.title and keep.rn = 1
 where pa.activity_id = dup.id
   and dup.rn > 1;

with ranked as (
  select id, row_number() over (partition by title order by id) as rn
    from public.activities_catalog
)
delete from public.activities_catalog c
 using ranked r
 where c.id = r.id
   and r.rn > 1;

create unique index if not exists activities_catalog_title_key on public.activities_catalog (title);

-- 1b. Une séance bien-être terminée plusieurs fois créait une ligne à chaque
--     fois ; une seule suffit pour savoir qu'elle a été faite.
with ranked as (
  select id, row_number() over (
           partition by user_id, program_id, session_index order by completed_at
         ) as rn
    from public.wellbeing_sessions_completed
)
delete from public.wellbeing_sessions_completed w
 using ranked r
 where w.id = r.id
   and r.rn > 1;

create unique index if not exists wellbeing_sessions_completed_unique
  on public.wellbeing_sessions_completed (user_id, program_id, session_index);

-- 2. Plus de privilèges accordés par défaut aux futures tables.
alter default privileges in schema public
  revoke select, insert, update, delete on tables from authenticated;

alter default privileges in schema public
  revoke select on tables from anon;
