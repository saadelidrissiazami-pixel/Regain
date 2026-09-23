-- Regain — les parcours : une suite de jours qui enseignent une technique.
--
-- Pas de nouvelle table. Un jour de parcours *est* une séance : elle gagne seulement le parcours
-- auquel elle appartient et son rang. La progression se déduit des séances déjà faites, donc
-- rien ne peut se désynchroniser entre « ce que j'ai fait » et « où j'en suis ».
--
-- Les trois premiers jours de chaque parcours sont libres, comme les trois séances libres de
-- chaque thème : de quoi voir si ça vaut le coup avant de payer.

alter table public.wellbeing_programs add column if not exists course_slug text;
alter table public.wellbeing_programs add column if not exists course_day int;

-- Un parcours ne peut pas avoir deux fois le même jour.
create unique index if not exists wellbeing_programs_course_day_key
  on public.wellbeing_programs (course_slug, course_day)
  where course_slug is not null;

insert into public.wellbeing_programs
  (title, category, session_count, premium_only, slug, duration_minutes, course_slug, course_day) values

-- Découvrir la méditation : du repère concret vers le choix autonome.
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

-- Mieux dormir : réduire l'effort autour du coucher, sans promettre l'endormissement.
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
  title = excluded.title,
  category = excluded.category,
  duration_minutes = excluded.duration_minutes,
  premium_only = excluded.premium_only,
  course_slug = excluded.course_slug,
  course_day = excluded.course_day;
