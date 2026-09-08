-- Regain — disponibilités en heures précises + fiches d'activité détaillées

alter table public.availability_slots
  add column start_time time not null default '09:00',
  add column end_time time not null default '10:00';

alter table public.availability_slots
  add constraint availability_slots_time_order check (end_time > start_time);

alter table public.activities_catalog
  add column steps jsonb not null default '[]';
