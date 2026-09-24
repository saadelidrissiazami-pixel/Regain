import { toLocalISODate } from '../../lib/week';

export type Sample = { at: string; value: number };

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Moyenne par jour (dates ISO locales), null pour un jour sans mesure. */
export function dailyAverages(samples: Sample[], days: string[]): (number | null)[] {
  return days.map((day) => average(samples.filter((s) => toLocalISODate(new Date(s.at)) === day).map((s) => s.value)));
}

/** The last N days up to and including `today`, oldest first. */
export function lastDays(today: string, count = 7): string[] {
  const [y, m, d] = today.split('-').map(Number);
  return Array.from({ length: count }, (_, i) => toLocalISODate(new Date(y, m - 1, d - (count - 1 - i))));
}

/** Splits the last 7 days' readings from the 7 days before them. */
export function splitWeeks(samples: Sample[], today: string): { current: number[]; previous: number[] } {
  const current = new Set(lastDays(today, 7));
  const previous = new Set(lastDays(today, 14).slice(0, 7));
  const dayOf = (s: Sample) => toLocalISODate(new Date(s.at));
  return {
    current: samples.filter((s) => current.has(dayOf(s))).map((s) => s.value),
    previous: samples.filter((s) => previous.has(dayOf(s))).map((s) => s.value),
  };
}

/** The change as a rounded %; null when either period has no readings. */
export function percentChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/** Average energy (1-5), in words. */
export function energyLabel(avg: number): { label: string; emoji: string } {
  if (avg < 2.5) return { label: 'Low', emoji: '🪫' };
  if (avg < 3.7) return { label: 'Medium', emoji: '🙂' };
  return { label: 'Good', emoji: '⚡' };
}

/** Average mood after sessions (1-5), in words. */
export function moodLabel(avg: number): string {
  if (avg < 2.5) return 'Hard';
  if (avg < 3.5) return 'Steady';
  return 'Positive';
}
