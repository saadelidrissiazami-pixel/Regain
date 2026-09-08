-- Regain — contenu détaillé (étapes) pour les activités qui en bénéficient le plus

update public.activities_catalog set steps = '[
  {"icon": "🙆", "title": "Étirement du cou", "description": "Penchez doucement la tête vers l’épaule droite, maintenez 15 secondes, puis changez de côté."},
  {"icon": "💪", "title": "Étirement des épaules", "description": "Amenez un bras devant la poitrine, maintenez-le avec l’autre bras 15 secondes, puis changez."},
  {"icon": "🧎", "title": "Étirement du dos", "description": "Penchez-vous doucement vers l’avant, laissez vos bras pendre, relâchez pendant 20 secondes."},
  {"icon": "🦵", "title": "Étirement des jambes", "description": "Debout, ramenez un talon vers la fesse en vous tenant si besoin, maintenez 15 secondes par jambe."},
  {"icon": "🌬️", "title": "Respiration finale", "description": "Terminez par 3 respirations profondes et lentes, pour clôturer en douceur."}
]'::jsonb
where title = 'Étirements doux';

update public.activities_catalog set steps = '[
  {"icon": "🧍", "title": "Position de planche", "description": "Avant-bras au sol, corps aligné de la tête aux talons, gainez 20 à 30 secondes."},
  {"icon": "➡️", "title": "Planche latérale droite", "description": "Appui sur l’avant-bras droit, corps de profil, maintenez 15 à 20 secondes."},
  {"icon": "⬅️", "title": "Planche latérale gauche", "description": "Même exercice de l’autre côté, 15 à 20 secondes."},
  {"icon": "😮‍💨", "title": "Relâchement", "description": "Reposez-vous à genoux et respirez profondément avant de recommencer si besoin."}
]'::jsonb
where title = 'Séance de gainage à la maison';
