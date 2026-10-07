-- Regain — trois balades, pour que le tracé GPS et la découverte de quartier existent à nouveau.
--
-- Ces deux fonctionnalités n'ont jamais été retirées du code : WalkingLoopCard et
-- NeighborhoodHistoryCard sont intactes. Elles étaient attachées à « Marche rapide 30 min »,
-- « Balade en nature » et « Explorer un nouveau quartier », que 0024 a désactivées avec tout
-- l'ancien catalogue. Plus aucune activité proposée ne les déclenchait, donc personne ne les
-- voyait plus.
--
-- Elles ne sont pas réactivées telles quelles : c'étaient des activités de 30 à 60 minutes
-- écrites avant que le catalogue ne se recentre sur ce qu'on peut commencer un mauvais jour.
-- Trois nouvelles les remplacent, dans la forme du catalogue actuel — une première action, une
-- règle d'arrêt — et dans sa durée : vingt, vingt-cinq et trente minutes, soit le haut de la
-- fourchette et non une catégorie à part.
--
-- Leurs étapes vivent dans le bundle (src/features/activities/steps.ts) et non ici, pour la
-- raison que 0012 et 0016 illustrent : écrites en SQL, elles ne sont qu'en français, et un build
-- anglais les afficherait telles quelles.

insert into public.activities_catalog
  (title, category, duration_minutes, energy_required, indoor_outdoor, cost_level, tags, first_action, stop_rule) values

('Marcher une boucle près de chez soi', 'outdoor', 20, 'moyen', 'outdoor', 'gratuit',
 array['plus_mouvement','plus_energie','gerer_stress'],
 'Sors et laisse l''application tracer une boucle qui revient à ton point de départ.',
 'Quand tu reviens à l''endroit d''où tu es parti.'),

('Découvrir une rue qu''on ne prend jamais', 'outdoor', 25, 'moyen', 'outdoor', 'gratuit',
 array['reduire_ecrans','plus_mouvement','plus_social'],
 'Sors et tourne dans la première rue que tu ne prends jamais.',
 'Quand tu as trouvé trois choses à raconter.'),

('Marcher trente minutes en accélérant', 'physique', 30, 'eleve', 'outdoor', 'gratuit',
 array['plus_mouvement','plus_energie'],
 'Pars à allure normale : les cinq premières minutes sont un échauffement, rien d''autre.',
 'À la fin des six minutes de marche lente.')

on conflict (title) do update set
  category = excluded.category,
  duration_minutes = excluded.duration_minutes,
  energy_required = excluded.energy_required,
  indoor_outdoor = excluded.indoor_outdoor,
  cost_level = excluded.cost_level,
  tags = excluded.tags,
  first_action = excluded.first_action,
  stop_rule = excluded.stop_rule,
  active = true;
