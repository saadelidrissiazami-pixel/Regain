import { toISODateUTC } from './week';
import { locale } from './i18n';

export function getUpcomingDates(count = 14, from = new Date()) {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short', month: 'short', day: 'numeric' });
  const dates: { value: string; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const value = toISODateUTC(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatter.format(new Date(value + 'T00:00:00'));
    dates.push({ value, label });
  }
  return dates;
}
