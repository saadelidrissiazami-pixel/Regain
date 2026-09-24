import { t } from '../../lib/i18n';
type DatedItem = { date: string; status: string };

/** A greeting for the time of day, lined up with the plan's own slots. */
export function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return t('Good morning');
  if (hour >= 12 && hour < 18) return t('Good afternoon');
  return t('Good evening');
}

/** Minutes between now and an “HH:MM” time on the given day (negative once it has passed). */
export function minutesUntil(date: string, startTime: string, now: Date): number {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);
  const start = new Date(year, month - 1, day, hours, minutes);
  return Math.round((start.getTime() - now.getTime()) / 60_000);
}

/** True once the activity is over by the clock (start plus duration has passed). */
export function isOver(date: string, startTime: string, durationMinutes: number, now: Date): boolean {
  return minutesUntil(date, startTime, now) + durationMinutes <= 0;
}

/** “in 25 min”, “in 1h 48”, “in 3h”; null once the time has passed. */
export function formatCountdown(minutes: number): string | null {
  if (minutes <= 0) return null;
  if (minutes < 60) return t('in {minutes} min', { minutes });
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? t('in {hours}h', { hours }) : t('in {hours}h {minutes}', { hours, minutes: String(rest).padStart(2, '0') });
}

/** The header's subtitle: what is left to do today. */
export function todaySubtitle(pendingToday: number, hour: number): string {
  if (pendingToday === 0) return t('Nothing planned before the day is out');
  const until = hour >= 18 ? t('this evening') : t('today');
  return pendingToday > 1 ? t('{count} activities {until}', { count: pendingToday, until }) : t('{count} activity {until}', { count: pendingToday, until });
}

export type WeekView<T extends DatedItem> = {
  /** Days from today onwards, with the activities still to do. */
  upcomingDays: { date: string; items: T[] }[];
  /** Activities left undone on days already gone: kept apart so they do not clutter. */
  pastPending: T[];
  doneCount: number;
  totalCount: number;
};

export function buildWeekView<T extends DatedItem>(items: T[], today: string): WeekView<T> {
  const pending = items.filter((item) => item.status !== 'realise');
  const upcoming = pending.filter((item) => item.date >= today);
  const dates = Array.from(new Set(upcoming.map((item) => item.date))).sort();
  return {
    upcomingDays: dates.map((date) => ({ date, items: upcoming.filter((item) => item.date === date) })),
    pastPending: pending.filter((item) => item.date < today),
    doneCount: items.length - pending.length,
    totalCount: items.length,
  };
}

/** The coach's line under the greeting: what matters now, without pressure. */
export function coachLine({
  hasPlan,
  doneCount,
  totalCount,
  pendingToday,
  hour,
}: {
  hasPlan: boolean;
  doneCount: number;
  totalCount: number;
  pendingToday: number;
  hour: number;
}): string {
  if (!hasPlan) return t('Your week is still to be built — we will do it together.');
  if (totalCount > 0 && doneCount === totalCount) return t('Week complete. Take the time to enjoy it.');
  if (pendingToday === 0) return hour >= 18 ? t('Nothing else planned tonight. Enjoy your evening.') : t('Nothing else planned today.');
  if (doneCount > 0) return t('Keep going — you are doing well.');
  return t('Here is what is planned for today.');
}
