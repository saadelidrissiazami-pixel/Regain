-- Regain — catalogue d'activités de départ (Phase 3)
-- 3 activités par catégorie, taguées par objectif (voir src/features/onboarding/options.ts)
-- pour permettre au moteur de règles de matcher énergie / budget / objectifs.

-- Garde d'idempotence : ce fichier peut être rejoué sans dupliquer le catalogue.
create unique index if not exists activities_catalog_title_key on public.activities_catalog (title);

insert into public.activities_catalog (title, category, duration_minutes, energy_required, indoor_outdoor, cost_level, tags) values
-- physique
('Marche rapide 30 min', 'physique', 30, 'moyen', 'outdoor', 'gratuit', array['plus_mouvement','plus_energie','reduire_ecrans']),
('Séance de gainage à la maison', 'physique', 20, 'moyen', 'indoor', 'gratuit', array['plus_mouvement','confiance_en_soi']),
('Cours de sport en salle', 'physique', 60, 'eleve', 'indoor', 'modere', array['plus_mouvement','plus_energie']),
-- outdoor
('Balade en nature', 'outdoor', 45, 'bas', 'outdoor', 'gratuit', array['reduire_ecrans','gerer_stress']),
('Vélo dans le quartier', 'outdoor', 40, 'moyen', 'outdoor', 'gratuit', array['plus_mouvement','plus_energie']),
('Pique-nique avec un proche', 'outdoor', 60, 'bas', 'outdoor', 'faible', array['plus_social','reduire_ecrans']),
-- indoor
('Rangement et désencombrement d''une pièce', 'indoor', 30, 'moyen', 'indoor', 'gratuit', array['routine_stable','reduire_ecrans']),
('Cuisiner un nouveau plat', 'indoor', 45, 'moyen', 'indoor', 'faible', array['routine_stable','reduire_ecrans']),
('Lecture d''un livre', 'indoor', 40, 'bas', 'indoor', 'gratuit', array['reduire_ecrans','gerer_stress']),
-- social
('Appel à un proche', 'social', 20, 'bas', 'indifferent', 'gratuit', array['plus_social','reduire_ecrans']),
('Café avec un ami', 'social', 60, 'bas', 'outdoor', 'faible', array['plus_social']),
('Rejoindre un groupe ou une association locale', 'social', 90, 'moyen', 'outdoor', 'gratuit', array['plus_social','routine_stable']),
-- relaxation
('Bain chaud ou douche relaxante', 'relaxation', 20, 'bas', 'indoor', 'gratuit', array['gerer_stress','mieux_dormir']),
('Étirements doux', 'relaxation', 15, 'bas', 'indoor', 'gratuit', array['gerer_stress','mieux_dormir']),
('Musique calme et rien faire', 'relaxation', 20, 'bas', 'indifferent', 'gratuit', array['gerer_stress','reduire_ecrans']),
-- meditation
('Respiration 4-7-8', 'meditation', 10, 'bas', 'indoor', 'gratuit', array['gerer_stress','mieux_dormir']),
('Méditation guidée 10 min', 'meditation', 10, 'bas', 'indoor', 'gratuit', array['gerer_stress','confiance_en_soi']),
('Scan corporel avant le coucher', 'meditation', 15, 'bas', 'indoor', 'gratuit', array['mieux_dormir']),
-- dev_perso
('Journaling du soir', 'dev_perso', 15, 'bas', 'indoor', 'gratuit', array['confiance_en_soi','gerer_stress','routine_stable']),
('Définir 3 priorités de la semaine', 'dev_perso', 20, 'moyen', 'indoor', 'gratuit', array['routine_stable','confiance_en_soi']),
('Écouter un podcast inspirant', 'dev_perso', 30, 'bas', 'indifferent', 'gratuit', array['confiance_en_soi']),
-- recuperation
('Sieste ou repos', 'recuperation', 20, 'bas', 'indoor', 'gratuit', array['mieux_dormir','plus_energie']),
('Soirée sans écran', 'recuperation', 60, 'bas', 'indoor', 'gratuit', array['reduire_ecrans','mieux_dormir']),
('Coucher à heure fixe', 'recuperation', 10, 'bas', 'indoor', 'gratuit', array['mieux_dormir','routine_stable']),
-- temps_libre
('Activité créative libre (dessin, musique...)', 'temps_libre', 45, 'moyen', 'indoor', 'gratuit', array['reduire_ecrans','confiance_en_soi']),
('Explorer un nouveau quartier', 'temps_libre', 60, 'moyen', 'outdoor', 'gratuit', array['reduire_ecrans','plus_social']),
('Temps libre sans objectif', 'temps_libre', 30, 'bas', 'indifferent', 'gratuit', array['routine_stable'])
on conflict (title) do nothing;
