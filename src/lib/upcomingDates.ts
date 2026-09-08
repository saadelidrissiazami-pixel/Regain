import { toISODateUTC } from './week';

export function getUpcomingDates(count = 14) {
  const formatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const dates: { value: string; label: string }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const value = toISODateUTC(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const label = i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : formatter.format(new Date(value + 'T00:00:00'));
    dates.push({ value, label });
  }
  return dates;
}
