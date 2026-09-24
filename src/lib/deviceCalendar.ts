import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExpoCalendar } from 'expo-calendar';
import { Platform } from 'react-native';

import type { AvailabilitySlot } from '../features/availability/types';
import { buildCalendarEvents } from '../features/planning/schedule';
import { areRemindersEnabled } from './notifications';
import type { PlannedActivityRow } from './planning';
import { isExpoGo, isWeb } from './runtime';
import { fromLocalISODate, getDateForDayOfWeek } from './week';

// SDK 57: the old functions (getCalendarsAsync, createEventAsync…) imported from “expo-calendar”
// throw at runtime. We use the new object API instead.
type CalendarModule = typeof import('expo-calendar');

const CALENDAR_TITLE = 'Regain';
const CALENDAR_COLOR = '#FF6B57';
const CALENDAR_ID_KEY = 'regain.calendar.id';
const AUTO_SYNC_KEY = 'regain.calendar.autoSync';
const ALARM_MINUTES_BEFORE = 15;
/** How far ahead we clean up when the user turns syncing off. */
const CLEAR_HORIZON_DAYS = 60;

export const calendarUnavailableReason: string | null = isWeb
  ? 'Calendar syncing happens from the mobile app.'
  : isExpoGo
    ? 'Expo Go has no calendar access: syncing will work in the installed app (a development build or a published release).'
    : null;

export const isCalendarSupported = calendarUnavailableReason === null;

async function getCalendarModule(): Promise<CalendarModule> {
  if (calendarUnavailableReason) throw new Error(calendarUnavailableReason);
  return import('expo-calendar');
}

async function ensurePermission(Calendar: CalendarModule) {
  // Full access, not write-only: we need to create the Regain calendar and read its events back
  // in order to replace them.
  const { status } = await Calendar.requestCalendarPermissions();
  if (status !== 'granted') {
    throw new Error('Allow calendar access for Regain in your device settings.');
  }
}

async function createRegainCalendar(Calendar: CalendarModule): Promise<ExpoCalendar> {
  if (Platform.OS === 'ios') {
    // The default calendar's account first (often iCloud), so the calendar
    // Regain suive l'utilisateur sur ses autres appareils ; le compte local en secours
    // (some accounts, Exchange among them, refuse calendar creation).
    const sources = [
      Calendar.getDefaultCalendarSync().source,
      ...Calendar.getSourcesSync().filter((s) => s.type === Calendar.SourceType.LOCAL),
    ];
    let lastError: unknown = new Error('No calendar account is available on this device.');
    for (const source of sources) {
      try {
        return await Calendar.createCalendar({
          title: CALENDAR_TITLE,
          color: CALENDAR_COLOR,
          entityType: Calendar.EntityTypes.EVENT,
          sourceId: source.id,
          source,
        });
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }

  return Calendar.createCalendar({
    title: CALENDAR_TITLE,
    name: CALENDAR_TITLE,
    color: CALENDAR_COLOR,
    ownerAccount: CALENDAR_TITLE,
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
    isVisible: true,
    isSynced: true,
    source: { isLocalAccount: true, name: CALENDAR_TITLE, type: 'LOCAL' },
  });
}

/** Finds the Regain calendar by the identifier we remembered (a personal calendar of the same
 *  name is never touched), and creates it otherwise. */
async function getRegainCalendar(Calendar: CalendarModule, { create }: { create: boolean }): Promise<ExpoCalendar | null> {
  const savedId = await AsyncStorage.getItem(CALENDAR_ID_KEY).catch(() => null);
  if (savedId) {
    try {
      const calendar = await Calendar.ExpoCalendar.get(savedId);
      if (calendar.allowsModifications) return calendar;
    } catch {
      // The calendar was deleted from the Calendar app: make a new one.
    }
  }
  if (!create) return null;

  const calendar = await createRegainCalendar(Calendar);
  await AsyncStorage.setItem(CALENDAR_ID_KEY, calendar.id).catch(() => {});
  return calendar;
}

/** Replaces the week's Regain events with the current plan. */
export async function syncWeekPlanToCalendar(
  items: PlannedActivityRow[],
  availability: AvailabilitySlot[],
  weekStart: string
): Promise<number> {
  const Calendar = await getCalendarModule();
  await ensurePermission(Calendar);
  const calendar = (await getRegainCalendar(Calendar, { create: true }))!;

  const existing = await calendar.listEvents(fromLocalISODate(weekStart), fromLocalISODate(getDateForDayOfWeek(weekStart, 7)));
  await Promise.all(existing.map((event) => event.delete().catch(() => {})));

  // Regain's own reminders already fire 15 min ahead: no double alert.
  const alarms = (await areRemindersEnabled())
    ? []
    : [{ relativeOffset: -ALARM_MINUTES_BEFORE, method: Calendar.AlarmMethod.ALERT }];
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const events = buildCalendarEvents(items, availability);
  for (const event of events) {
    await calendar.createEvent({ ...event, timeZone, alarms });
  }
  return events.length;
}

export async function isCalendarAutoSyncEnabled(): Promise<boolean> {
  if (!isCalendarSupported) return false;
  return (await AsyncStorage.getItem(AUTO_SYNC_KEY).catch(() => null)) === 'true';
}

/** Active la synchro automatique et envoie tout de suite la semaine en cours. */
export async function enableCalendarAutoSync(items: PlannedActivityRow[], availability: AvailabilitySlot[], weekStart: string) {
  const count = await syncWeekPlanToCalendar(items, availability, weekStart);
  await AsyncStorage.setItem(AUTO_SYNC_KEY, 'true');
  return count;
}

/** Turns syncing off and removes upcoming activities from the calendar (the past stays). */
export async function disableCalendarAutoSync() {
  await AsyncStorage.removeItem(AUTO_SYNC_KEY).catch(() => {});
  if (!isCalendarSupported) return;
  const Calendar = await getCalendarModule();
  const { status } = await Calendar.getCalendarPermissions();
  if (status !== 'granted') return;
  const calendar = await getRegainCalendar(Calendar, { create: false });
  if (!calendar) return;

  const now = new Date();
  const horizon = new Date(now.getTime() + CLEAR_HORIZON_DAYS * 86_400_000);
  const upcoming = await calendar.listEvents(now, horizon);
  await Promise.all(upcoming.map((event) => event.delete().catch(() => {})));
}

/** Called after each plan generation; does nothing when syncing is off. */
export async function autoSyncWeekPlan(items: PlannedActivityRow[], availability: AvailabilitySlot[], weekStart: string) {
  if (!(await isCalendarAutoSyncEnabled())) return;
  await syncWeekPlanToCalendar(items, availability, weekStart);
}
