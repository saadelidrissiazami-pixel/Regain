-- Regain — les glucides et les lipides à côté des protéines.
--
-- 0029 ne gardait que les protéines, en expliquant que les autres macros « ne sont pas demandées
-- à la saisie et resteraient vides ». C'est justement ce qui change : la saisie propose désormais
-- un aliment et en déduit les quatre nombres, donc l'usager n'a plus à les connaître.
--
-- Les deux colonnes sont nullables, et les lignes déjà saisies restent telles quelles : une
-- journée d'avant cette migration a des calories et des protéines, et rien d'autre. Les totaux
-- traitent le null comme zéro, ce qui sous-estime plutôt que d'inventer.

alter table public.nutrition_entries
  add column if not exists carbs_g integer check (carbs_g is null or (carbs_g >= 0 and carbs_g <= 1000)),
  add column if not exists fat_g integer check (fat_g is null or (fat_g >= 0 and fat_g <= 500));
