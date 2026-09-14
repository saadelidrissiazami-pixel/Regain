-- Regain — régénération de planning transactionnelle et non destructive
--
-- Deux garanties apportées par cette fonction :
--   1. les activités déjà réalisées ne sont jamais supprimées (l'historique, les stats
--      et le streak restent cohérents après un « Régénérer mon planning ») ;
--   2. suppression + insertion se font dans une seule transaction, donc une coupure
--      réseau ne peut plus laisser l'utilisateur sans aucun planning.
--
-- security invoker (défaut) : les policies RLS de planned_activities s'appliquent,
-- et l'utilisateur est lu depuis auth.uid() plutôt que reçu en paramètre.

create or replace function public.replace_week_plan(p_week_start date, p_items jsonb)
returns void
language plpgsql
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Utilisateur non authentifié';
  end if;

  delete from public.planned_activities
  where user_id = v_user
    and week_start_date = p_week_start
    and status <> 'realise';

  insert into public.planned_activities (user_id, activity_id, week_start_date, date, time_slot, status)
  select
    v_user,
    (item ->> 'activity_id')::uuid,
    p_week_start,
    (item ->> 'date')::date,
    item ->> 'time_slot',
    'propose'
  from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) as item;
end;
$$;

grant execute on function public.replace_week_plan(date, jsonb) to authenticated;
