export function toISODateUTC(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

/** The *local* calendar date of an instant, in ISO form (an activity ticked at 00:30 in Paris
 *  belongs to that day, not to the one before, as the UTC date would have it). */
export function toLocalISODate(date: Date): string {
  return toISODateUTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The inverse of toLocalISODate: midnight, local time, on the given day (new Date('YYYY-MM-DD')
 *  le lirait en UTC et pourrait tomber la veille). */
export function fromLocalISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
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
