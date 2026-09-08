-- Regain — structure des disponibilités (Phase 2)
-- Remplace le champ libre recurrence_rule par une structure exploitable par le
-- moteur de règles (Phase 3) : jour de semaine OU date précise + créneau
-- (matin/après-midi/soir), aligné avec typical_energy_by_slot de l'onboarding.

alter table public.availability_slots drop column if exists recurrence_rule;

alter table public.availability_slots
  add column day_of_week smallint check (day_of_week between 0 and 6),
  add column time_slot text not null default 'matin' check (time_slot in ('matin', 'apres_midi', 'soir'));

alter table public.availability_slots
  add constraint availability_slots_shape check (
    (is_recurring and day_of_week is not null and specific_date is null)
    or
    (not is_recurring and specific_date is not null and day_of_week is null)
  );
