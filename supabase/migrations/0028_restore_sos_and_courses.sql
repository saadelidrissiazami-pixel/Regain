-- Regain — les SOS et les parcours reviennent, pour la 1.1.
--
-- 0027 les avait mis de côté le temps que le build 3 passe la revue. La 1.1 embarque leur texte
-- et filtre côté client ce qu'elle ne sait pas jouer : le problème de séquencement qui avait
-- motivé le retrait ne peut plus se reproduire.
--
-- Les inserts sont ceux de 0025 et 0026, rejoués à l'identique. Les identifiants changent, ce
-- qui est sans conséquence : aucune séance terminée ne les référençait.

insert into public.wellbeing_programs (title, category, session_count, premium_only, slug, duration_minutes) values
('Crise d''angoisse', 'SOS', 1, false, 'sos-angoisse', 2),
('Avant de prendre la parole', 'SOS', 1, false, 'sos-prise-de-parole', 2),
('Coup de stress au travail', 'SOS', 1, false, 'sos-stress-travail', 2),
('Ruminations nocturnes', 'SOS', 1, false, 'sos-ruminations', 2)
on conflict (slug) do update set premium_only = false, category = excluded.category;

insert into public.wellbeing_programs
  (title, category, session_count, premium_only, slug, duration_minutes, course_slug, course_day) values
('Trouver un appui', 'Parcours', 1, false, 'parcours-meditation-j1', 2, 'decouvrir-meditation', 1),
('Suivre un mouvement', 'Parcours', 1, false, 'parcours-meditation-j2', 3, 'decouvrir-meditation', 2),
('Revenir, tout simplement', 'Parcours', 1, false, 'parcours-meditation-j3', 3, 'decouvrir-meditation', 3),
('Un petit compte', 'Parcours', 1, true, 'parcours-meditation-j4', 4, 'decouvrir-meditation', 4),
('Retirer le compte', 'Parcours', 1, true, 'parcours-meditation-j5', 4, 'decouvrir-meditation', 5),
('Reconnaître une pensée', 'Parcours', 1, true, 'parcours-meditation-j6', 5, 'decouvrir-meditation', 6),
('Faire une place à ce qui est là', 'Parcours', 1, true, 'parcours-meditation-j7', 5, 'decouvrir-meditation', 7),
('Revenir grâce aux sons', 'Parcours', 1, true, 'parcours-meditation-j8', 5, 'decouvrir-meditation', 8),
('Choisir son repère', 'Parcours', 1, true, 'parcours-meditation-j9', 6, 'decouvrir-meditation', 9),
('Une pause à ta mesure', 'Parcours', 1, true, 'parcours-meditation-j10', 6, 'decouvrir-meditation', 10),
('Terminer la journée', 'Parcours', 1, false, 'parcours-sommeil-j1', 3, 'mieux-dormir', 1),
('Sentir le soutien du lit', 'Parcours', 1, false, 'parcours-sommeil-j2', 3, 'mieux-dormir', 2),
('Laisser respirer', 'Parcours', 1, false, 'parcours-sommeil-j3', 4, 'mieux-dormir', 3),
('Desserrer doucement', 'Parcours', 1, true, 'parcours-sommeil-j4', 4, 'mieux-dormir', 4),
('Parcourir le corps', 'Parcours', 1, true, 'parcours-sommeil-j5', 5, 'mieux-dormir', 5),
('Déposer ce qui reste', 'Parcours', 1, true, 'parcours-sommeil-j6', 5, 'mieux-dormir', 6),
('Reconnaître le scénario', 'Parcours', 1, true, 'parcours-sommeil-j7', 5, 'mieux-dormir', 7),
('Retrouver un lieu familier', 'Parcours', 1, true, 'parcours-sommeil-j8', 6, 'mieux-dormir', 8),
('Laisser le sommeil venir', 'Parcours', 1, true, 'parcours-sommeil-j9', 6, 'mieux-dormir', 9),
('Composer son rituel', 'Parcours', 1, true, 'parcours-sommeil-j10', 7, 'mieux-dormir', 10)
on conflict (slug) do update set
  premium_only = excluded.premium_only,
  category = excluded.category,
  course_slug = excluded.course_slug,
  course_day = excluded.course_day;
