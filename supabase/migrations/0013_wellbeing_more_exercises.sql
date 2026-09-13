-- Regain — plus d'exercices par catégorie bien-être, classés par durée

alter table public.wellbeing_programs add column if not exists duration_minutes int not null default 3;

-- Durées des exercices existants
update public.wellbeing_programs set duration_minutes = 2 where slug = 'respiration-4-7-8';
update public.wellbeing_programs set duration_minutes = 3 where slug = 'meditation-matin';
update public.wellbeing_programs set duration_minutes = 3 where slug = 'journaling-clarifier';
update public.wellbeing_programs set duration_minutes = 3 where slug = 'confiance-reussite';
update public.wellbeing_programs set duration_minutes = 3 where slug = 'sommeil-relacher';
update public.wellbeing_programs set duration_minutes = 3 where slug = 'detachement-regard-autres';

-- Nouveaux exercices
insert into public.wellbeing_programs (title, category, session_count, premium_only, slug, duration_minutes) values
('Respiration express', 'Respiration', 1, false, 'respiration-express', 1),
('Cohérence cardiaque', 'Respiration', 1, false, 'coherence-cardiaque', 5),

('Pause d''une minute', 'Méditation', 1, false, 'meditation-pause-1min', 1),
('Méditation du soir', 'Méditation', 1, false, 'meditation-soir', 5),

('Gratitude express', 'Journaling', 1, false, 'journaling-gratitude-express', 1),
('Vider sa tête', 'Journaling', 1, false, 'journaling-vider-tete', 4),

('Trois qualités', 'Confiance en soi', 1, false, 'confiance-trois-qualites', 1),
('Se préparer à un moment difficile', 'Confiance en soi', 1, false, 'confiance-preparation', 4),

('Ralentir avant de dormir', 'Sommeil', 1, false, 'sommeil-ralentir', 1),
('Scan corporel complet', 'Sommeil', 1, false, 'sommeil-scan-corporel', 6),

('Ancrage rapide', 'En public', 1, false, 'public-ancrage-rapide', 1),
('Respirer dans la foule', 'En public', 1, false, 'public-respirer-foule', 4);
