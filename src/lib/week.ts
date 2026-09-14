export function toISODateUTC(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

/** Date calendaire *locale* d'un instant, au format ISO (une activité cochée à 00h30 à Paris
 *  appartient à ce jour-là, pas à la veille comme le donnerait la date UTC). */
export function toLocalISODate(date: Date): string {
  return toISODateUTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Inverse de toLocalISODate : minuit, heure locale, du jour donné (new Date('AAAA-MM-JJ')
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
