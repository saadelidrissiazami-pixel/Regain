-- Regain — remplacement atomique du planning hebdomadaire
--
-- Corrige deux défauts de la génération côté client :
--   1. le delete + insert en deux requêtes laissait l'utilisateur sans planning
--      du tout si l'insert échouait (réseau coupé entre les deux) ;
--   2. le delete emportait les activités déjà réalisées, ce qui remettait à zéro
--      les statistiques et l'historique de la semaine en cours.
--
-- security invoker : les policies RLS de planned_activities s'appliquent donc
-- normalement, la fonction ne peut pas toucher aux lignes d'un autre compte.

create or replace function public.replace_week_plan(p_week_start date, p_items jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Non authentifié';
  end if;

  delete from public.planned_activities
   where user_id = auth.uid()
     and week_start_date = p_week_start
     and status <> 'realise';

  insert into public.planned_activities (user_id, activity_id, week_start_date, date, time_slot, status)
  select
    auth.uid(),
    (item->>'activity_id')::uuid,
    p_week_start,
    (item->>'date')::date,
    item->>'time_slot',
    'propose'
  from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) as item;
end;
$$;

revoke all on function public.replace_week_plan(date, jsonb) from public, anon;
grant execute on function public.replace_week_plan(date, jsonb) to authenticated;
