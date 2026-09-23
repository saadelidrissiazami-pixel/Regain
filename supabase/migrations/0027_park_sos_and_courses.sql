-- Regain — on remet les SOS et les parcours de côté, le temps que la 1.1 sorte.
--
-- Erreur de séquencement de ma part : 0025 et 0026 ont ajouté 24 séances en base alors que le
-- binaire en cours de revue chez Apple est le build 3, compilé avant. Ce build lit tout le
-- catalogue sans filtrer et n'embarque le texte que des 37 séances d'origine — il affichait donc
-- deux tuiles de thème parasites, et « Séance introuvable » sur tout ce qu'il ne connaît pas.
--
-- Le filtre côté client qui empêche exactement ça est arrivé après (4b5edb6). Il protégera les
-- versions suivantes ; il ne peut rien pour un binaire déjà compilé.
--
-- Ces lignes reviendront avec la 1.1, par une migration qui rejoue les inserts de 0025 et 0026.
-- Aucune séance terminée ne les référence à ce stade, donc rien n'est perdu.

delete from public.wellbeing_programs where category in ('SOS', 'Parcours');
