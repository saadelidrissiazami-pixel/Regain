export function toISODateUTC(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

// Date civile d'un instant *dans le fuseau de l'appareil*. À utiliser partout où une
// date est comparée à ce que l'utilisateur appelle « aujourd'hui » : un `timestamptz`
// tronqué à 10 caractères donne la date UTC, décalée d'un jour en soirée en France.
export function toLocalISODate(date: Date): string {
  return toISODateUTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getToday(): string {
  return toLocalISODate(new Date());
}

export function getWeekStart(date = new Date()): string {
  const day = date.getDay(); // 0=dimanche..6=samedi (heure locale)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return toISODateUTC(date.getFullYear(), date.getMonth(), date.getDate() + diffToMonday);
}

export function getDateForDayOfWeek(weekStart: string, dayOfWeek: number): string {
  const [year, month, day] = weekStart.split('-').map(Number);
  return toISODateUTC(year, month - 1, day + dayOfWeek);
}
