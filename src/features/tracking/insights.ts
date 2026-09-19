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

/** Les N derniers jours jusqu'à `today` inclus, du plus ancien au plus récent. */
export function lastDays(today: string, count = 7): string[] {
  const [y, m, d] = today.split('-').map(Number);
  return Array.from({ length: count }, (_, i) => toLocalISODate(new Date(y, m - 1, d - (count - 1 - i))));
}

/** Sépare les mesures des 7 derniers jours de celles des 7 jours d'avant. */
export function splitWeeks(samples: Sample[], today: string): { current: number[]; previous: number[] } {
  const current = new Set(lastDays(today, 7));
  const previous = new Set(lastDays(today, 14).slice(0, 7));
  const dayOf = (s: Sample) => toLocalISODate(new Date(s.at));
  return {
    current: samples.filter((s) => current.has(dayOf(s))).map((s) => s.value),
    previous: samples.filter((s) => previous.has(dayOf(s))).map((s) => s.value),
  };
}

/** Évolution en % arrondie ; null si l'une des deux périodes est vide. */
export function percentChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/** Énergie moyenne (1-5) en mots. */
export function energyLabel(avg: number): { label: string; emoji: string } {
  if (avg < 2.5) return { label: 'Basse', emoji: '🪫' };
  if (avg < 3.7) return { label: 'Moyenne', emoji: '🙂' };
  return { label: 'Bonne', emoji: '⚡' };
}

/** Humeur moyenne après les séances (1-5) en mots. */
export function moodLabel(avg: number): string {
  if (avg < 2.5) return 'Difficile';
  if (avg < 3.5) return 'Stable';
  return 'Positive';
}
