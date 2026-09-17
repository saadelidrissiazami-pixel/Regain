import type { TimeSlot } from '../features/availability/types';

export const TIME_OPTIONS: string[] = (() => {
  const options: string[] = [];
  for (let h = 6; h <= 23; h++) {
    options.push(`${String(h).padStart(2, '0')}:00`);
    options.push(`${String(h).padStart(2, '0')}:30`);
  }
  return options;
})();

export function timeSlotFromStartTime(start: string): TimeSlot {
  const hour = Number(start.slice(0, 2));
  if (hour < 12) return 'matin';
  if (hour < 18) return 'apres_midi';
  return 'soir';
}

export function durationMinutes(start: string, end: string): number {
  const [sh, sm] = start.slice(0, 5).split(':').map(Number);
  const [eh, em] = end.slice(0, 5).split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export function formatTimeRange(start: string, end: string): string {
  return `${start.slice(0, 5)}–${end.slice(0, 5)}`;
}

const TIME_GROUP_LABELS: Record<TimeSlot, string> = {
  matin: 'Matin',
  apres_midi: 'Après-midi',
  soir: 'Soir',
};

/** Options d'horaires pour une liste déroulante, groupées par moment de la journée. */
export const TIME_SELECT_OPTIONS: { value: string; label: string; group: string }[] = TIME_OPTIONS.map((time) => ({
  value: time,
  label: time,
  group: TIME_GROUP_LABELS[timeSlotFromStartTime(time)],
}));
