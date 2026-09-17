type DatedItem = { date: string; status: string };

/** Salutation selon l'heure locale : « Bonjour » jusqu'à 17 h, « Bonsoir » ensuite. */
export function greetingFor(hour: number): string {
  return hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour';
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
