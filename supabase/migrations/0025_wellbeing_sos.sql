-- Regain — quatre séances SOS, à déclencher au moment où ça ne va pas.
--
-- Deux minutes, une consigne à la fois, les yeux ouverts. Elles sont dans une catégorie à part :
-- l'application ne les range pas dans la grille des thèmes et ne les « recommande » jamais — on
-- ne suggère pas une séance d'urgence à quelqu'un qui n'en a pas besoin.
--
-- Elles sont gratuites, et 0023_explicit_premium_catalog.sql les nomme désormais dans la liste
-- des séances libres : mettre du contenu de détresse derrière un abonnement ne se défend pas, et
-- serait de toute façon un mauvais dossier en revue App Store.

insert into public.wellbeing_programs (title, category, session_count, premium_only, slug, duration_minutes) values
('Crise d''angoisse', 'SOS', 1, false, 'sos-angoisse', 2),
('Avant de prendre la parole', 'SOS', 1, false, 'sos-prise-de-parole', 2),
('Coup de stress au travail', 'SOS', 1, false, 'sos-stress-travail', 2),
('Ruminations nocturnes', 'SOS', 1, false, 'sos-ruminations', 2)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  duration_minutes = excluded.duration_minutes,
  premium_only = false;
