export type TimeSlot = 'matin' | 'apres_midi' | 'soir';

export type AvailabilitySlot = {
  id: string;
  user_id: string;
  label: string | null;
  is_recurring: boolean;
  day_of_week: number | null;
  specific_date: string | null;
  time_slot: TimeSlot;
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  created_at: string;
};

export type NewAvailabilitySlot = {
  label: string | null;
  is_recurring: boolean;
  day_of_week: number | null;
  specific_date: string | null;
  time_slot: TimeSlot;
  start_time: string;
  end_time: string;
};
