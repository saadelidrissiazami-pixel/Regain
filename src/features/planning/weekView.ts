type DatedItem = { date: string; status: string };

/** Salutation selon le moment de la journée, calée sur les créneaux du planning. */
export function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Bonjour';
  if (hour >= 12 && hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

/** Minutes entre maintenant et une heure « HH:MM » du jour donné (négatif si c'est passé). */
export function minutesUntil(date: string, startTime: string, now: Date): number {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);
  const start = new Date(year, month - 1, day, hours, minutes);
  return Math.round((start.getTime() - now.getTime()) / 60_000);
}

/** Vrai quand l'activité est terminée à l'heure qu'il est (début + durée dépassés). */
export function isOver(date: string, startTime: string, durationMinutes: number, now: Date): boolean {
  return minutesUntil(date, startTime, now) + durationMinutes <= 0;
}

/** « dans 25 min », « dans 1 h 48 », « dans 3 h » ; null si l'heure est passée. */
export function formatCountdown(minutes: number): string | null {
  if (minutes <= 0) return null;
  if (minutes < 60) return `dans ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `dans ${hours} h` : `dans ${hours} h ${String(rest).padStart(2, '0')}`;
}

/** Sous-titre de l'en-tête : ce qu'il reste à faire aujourd'hui. */
export function todaySubtitle(pendingToday: number, hour: number): string {
  if (pendingToday === 0) return "Rien de prévu d'ici la fin de la journée";
  const until = hour >= 18 ? 'ce soir' : "aujourd'hui";
  return `${pendingToday} activité${pendingToday > 1 ? 's' : ''} ${until}`;
}

export type WeekView<T extends DatedItem> = {
  /** Jours à partir d'aujourd'hui, avec leurs activités encore à faire. */
  upcomingDays: { date: string; items: T[] }[];
  /** Activités non faites des jours déjà passés : rangées à part pour ne pas encombrer. */
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

/** Phrase de coach sous la salutation : ce qui compte maintenant, sans pression. */
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
  if (!hasPlan) return 'Ta semaine reste à construire, on s’en occupe ensemble.';
  if (totalCount > 0 && doneCount === totalCount) return 'Semaine bouclée. Prends le temps d’en profiter.';
  if (pendingToday === 0) return hour >= 18 ? 'Plus rien de prévu ce soir. Profite de ta soirée.' : "Plus rien de prévu aujourd'hui.";
  if (doneCount > 0) return 'On continue, tu fais du super travail.';
  return "Voici ce qui est prévu aujourd'hui.";
}
