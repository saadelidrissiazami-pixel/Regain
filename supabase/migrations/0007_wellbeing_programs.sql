-- Regain — programmes bien-être (Phase 4)
-- slug relie chaque programme à son contenu statique (src/features/wellbeing/content.ts).
-- session_count reflète le nombre réel de séances écrites, pas un objectif.

alter table public.wellbeing_programs add column if not exists slug text unique;

insert into public.wellbeing_programs (title, category, session_count, premium_only, slug) values
('Respiration 4-7-8', 'Respiration', 1, false, 'respiration-4-7-8'),
('Ancrage du matin', 'Méditation', 1, false, 'meditation-matin'),
('Clarifier sa journée', 'Journaling', 1, false, 'journaling-clarifier'),
('Se rappeler une réussite', 'Confiance en soi', 1, false, 'confiance-reussite'),
('Relâcher les tensions avant de dormir', 'Sommeil', 1, false, 'sommeil-relacher')
on conflict (slug) do nothing;
