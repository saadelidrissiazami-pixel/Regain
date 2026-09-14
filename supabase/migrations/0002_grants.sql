-- Regain — privilèges PostgreSQL pour anon/authenticated
-- Nécessaire en complément des policies RLS (0001_init.sql) : Postgres vérifie
-- les GRANT au niveau table AVANT d'évaluer les policies RLS.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.user_preferences,
  public.availability_slots,
  public.goals,
  public.planned_activities,
  public.activity_logs,
  public.energy_checkins,
  public.wellbeing_sessions_completed,
  public.subscriptions
to authenticated;

grant select on
  public.activities_catalog,
  public.wellbeing_programs
to anon, authenticated;

-- NOTE : ces privilèges par défaut sur les futures tables ont été révoqués en
-- 0015 — ils ouvraient automatiquement toute nouvelle table de `public`, y
-- compris une table où l'on aurait oublié `enable row level security`. Chaque
-- table doit désormais recevoir ses GRANT explicitement, comme ci-dessus.
