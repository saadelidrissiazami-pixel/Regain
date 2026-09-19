-- Regain — offre freemium de la bibliothèque bien-être.
-- Dans chaque catégorie, les 3 séances les plus courtes restent gratuites (par durée puis par
-- slug, comme src/features/wellbeing/access.ts) ; les autres sont réservées à Premium.
-- Rejouable : recalcule tout à chaque exécution, y compris après l'ajout de nouvelles séances.

with ranked as (
  select id,
         row_number() over (partition by category order by duration_minutes, slug) as rank
  from public.wellbeing_programs
)
update public.wellbeing_programs p
set premium_only = (r.rank > 3)
from ranked r
where p.id = r.id;
