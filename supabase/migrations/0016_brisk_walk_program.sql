-- Regain — programme d'intervalles structuré pour la marche rapide

update public.activities_catalog set steps = '[
  {"icon": "🚶", "title": "Échauffement", "description": "Marchez à allure normale pendant 5 minutes pour échauffer vos muscles et articulations."},
  {"icon": "🏃", "title": "Phase rapide 1", "description": "Accélérez à une allure soutenue (léger essoufflement, vous pouvez encore parler) pendant 5 minutes."},
  {"icon": "🚶", "title": "Récupération", "description": "Ralentissez à allure normale pendant 2 minutes, respirez profondément."},
  {"icon": "🏃", "title": "Phase rapide 2", "description": "Reprenez l''allure soutenue pendant 5 minutes."},
  {"icon": "🚶", "title": "Récupération", "description": "Allure normale pendant 2 minutes."},
  {"icon": "🏃", "title": "Phase rapide 3", "description": "Dernière accélération, tenez 5 minutes à allure soutenue."},
  {"icon": "🧘", "title": "Retour au calme", "description": "Terminez par 6 minutes de marche lente, en relâchant les épaules et la mâchoire."}
]'::jsonb
where title = 'Marche rapide 30 min';
