const DAY_FORMATTER = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });

export function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const label = DAY_FORMATTER.format(d);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** « Jeudi 17 sept., 19:20 » à partir d'un horodatage ISO. */
export function formatDateTimeLabel(isoTimestamp: string): string {
  const label = DATE_TIME_FORMATTER.format(new Date(isoTimestamp));
  return label.charAt(0).toUpperCase() + label.slice(1);
}
