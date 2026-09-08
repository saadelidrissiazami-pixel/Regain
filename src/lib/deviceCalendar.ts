import { Platform } from 'react-native';

import type { PlannedActivityRow } from './planning';
import { getDateForDayOfWeek } from './week';

const isSupported = Platform.OS !== 'web';
const CALENDAR_TITLE = 'Regain';

const TIME_SLOT_HOURS: Record<string, number> = { matin: 9, apres_midi: 14, soir: 19 };

async function getCalendarModule() {
  return import('expo-calendar');
}

export async function requestCalendarAccess(): Promise<boolean> {
  if (!isSupported) return false;
  const Calendar = await getCalendarModule();
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

async function getOrCreateRegainCalendar(): Promise<string> {
  const Calendar = await getCalendarModule();
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing = calendars.find((c) => c.title === CALENDAR_TITLE);
  if (existing) return existing.id;

  const defaultCalendarSource =
    Platform.OS === 'ios'
      ? (await Calendar.getDefaultCalendarAsync()).source
      : { isLocalAccount: true, name: CALENDAR_TITLE, type: 'LOCAL' as const };

  return Calendar.createCalendarAsync({
    title: CALENDAR_TITLE,
    color: '#FF6B57',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: Platform.OS === 'ios' ? (defaultCalendarSource as { id?: string }).id : undefined,
    source: defaultCalendarSource as never,
    name: CALENDAR_TITLE,
    ownerAccount: Platform.OS === 'ios' ? (defaultCalendarSource as { name: string }).name : CALENDAR_TITLE,
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
}

export async function syncWeekPlanToCalendar(items: PlannedActivityRow[], weekStart: string) {
  if (!isSupported) throw new Error('La synchronisation calendrier nécessite un appareil (pas de web).');
  const Calendar = await getCalendarModule();

  const granted = await requestCalendarAccess();
  if (!granted) throw new Error('Autorisez l’accès au calendrier pour Regain dans les réglages de l’appareil.');

  const calendarId = await getOrCreateRegainCalendar();

  const weekEnd = getDateForDayOfWeek(weekStart, 7);
  const existing = await Calendar.getEventsAsync(
    [calendarId],
    new Date(weekStart + 'T00:00:00'),
    new Date(weekEnd + 'T00:00:00')
  );
  await Promise.all(existing.map((e) => Calendar.deleteEventAsync(e.id).catch(() => {})));

  for (const item of items) {
    const hour = TIME_SLOT_HOURS[item.time_slot] ?? 9;
    const startDate = new Date(`${item.date}T00:00:00`);
    startDate.setHours(hour, 0, 0, 0);
    const endDate = new Date(startDate.getTime() + item.activities_catalog.duration_minutes * 60_000);

    await Calendar.createEventAsync(calendarId, {
      title: item.activities_catalog.title,
      startDate,
      endDate,
      notes: 'Planifié avec Regain',
    });
  }

  return items.length;
}
