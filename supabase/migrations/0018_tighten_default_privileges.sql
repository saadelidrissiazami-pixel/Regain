-- Regain — resserrage des privilèges par défaut + index d'historique bien-être

-- 0002_grants.sql accordait automatiquement select/insert/update/delete à `authenticated`
-- (et select à `anon`) sur TOUTE future table du schéma public. Une migration qui oublierait
-- `enable row level security` créerait donc une table ouverte en écriture sans le voir.
-- On revient à des GRANT explicites, table par table (ceux déjà accordés restent en place :
-- alter default privileges ne concerne que les objets créés ensuite).
alter default privileges in schema public revoke all on tables from authenticated;
alter default privileges in schema public revoke all on tables from anon;

-- wellbeing_sessions_completed conserve volontairement une ligne par séance terminée
-- (chacune porte sa propre note de fin de séance, donc les répétitions sont du contenu,
-- pas des doublons). L'index garde la lecture rapide à mesure que l'historique grandit.
create index if not exists wellbeing_sessions_completed_user_program_idx
  on public.wellbeing_sessions_completed (user_id, program_id);
