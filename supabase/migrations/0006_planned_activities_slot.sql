-- Regain — aligne planned_activities avec le créneau jour/moment (Phase 3)
-- au lieu d'un simple timestamp, pour rester cohérent avec availability_slots.

alter table public.planned_activities drop column if exists scheduled_at;

alter table public.planned_activities
  add column date date not null default current_date,
  add column time_slot text not null default 'matin' check (time_slot in ('matin', 'apres_midi', 'soir'));
