-- Regain — bibliothèque bien-être élargie : exercices détaillés et immersifs par catégorie

insert into public.wellbeing_programs (title, category, session_count, premium_only, slug, duration_minutes) values
('La respiration 4-6', 'Respiration', 1, false, 'respiration-4-6', 4),
('Le soupir physiologique', 'Respiration', 1, false, 'respiration-soupir-physiologique', 3),
('La respiration en escalier', 'Respiration', 1, false, 'respiration-escalier', 6),

('Méditation des 5 sens', 'Méditation', 1, false, 'meditation-5-sens', 5),
('Observer ses pensées', 'Méditation', 1, false, 'meditation-observer-pensees', 8),
('Scanner corporel', 'Méditation', 1, false, 'meditation-scan-corporel', 9),

('Le déchargement mental', 'Journaling', 1, false, 'journaling-dechargement-mental', 7),
('Le journal de confiance', 'Journaling', 1, false, 'journaling-confiance', 6),
('Transformer une peur en plan', 'Journaling', 1, false, 'journaling-peur-en-plan', 8),

('La posture de présence', 'Confiance en soi', 1, false, 'confiance-posture-presence', 3),
('Le micro-défi social', 'Confiance en soi', 1, false, 'confiance-micro-defi-social', 7),
('La preuve des 3 victoires', 'Confiance en soi', 1, false, 'confiance-trois-victoires', 4),

('Respiration d''endormissement', 'Sommeil', 1, false, 'sommeil-respiration-endormissement', 8),
('Le cerveau en veille', 'Sommeil', 1, false, 'sommeil-cerveau-en-veille', 7),
('Le voyage mental monotone', 'Sommeil', 1, false, 'sommeil-voyage-mental', 7),

('La sortie de 3 minutes', 'En public', 1, false, 'public-sortie-3-minutes', 3),
('Le mode observateur', 'En public', 1, false, 'public-mode-observateur', 4),
('Le bouton pause', 'En public', 1, false, 'public-bouton-pause', 4),
('Le kit d''urgence 2 minutes', 'En public', 1, false, 'public-kit-urgence', 2)
on conflict (slug) do nothing;
