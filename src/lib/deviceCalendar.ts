import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExpoCalendar } from 'expo-calendar';
import { Platform } from 'react-native';

import type { AvailabilitySlot } from '../features/availability/types';
import { buildCalendarEvents } from '../features/planning/schedule';
import { areRemindersEnabled } from './notifications';
import type { PlannedActivityRow } from './planning';
import { isExpoGo, isWeb } from './runtime';
import { fromLocalISODate, getDateForDayOfWeek } from './week';

// SDK 57 : les anciennes fonctions (getCalendarsAsync, createEventAsync...) importées depuis
// « expo-calendar » lèvent une erreur à l'exécution. On utilise la nouvelle API objet.
type CalendarModule = typeof import('expo-calendar');

const CALENDAR_TITLE = 'Regain';
const CALENDAR_COLOR = '#FF6B57';
const CALENDAR_ID_KEY = 'regain.calendar.id';
const AUTO_SYNC_KEY = 'regain.calendar.autoSync';
const ALARM_MINUTES_BEFORE = 15;
/** Horizon nettoyé quand l'utilisateur désactive la synchronisation. */
const CLEAR_HORIZON_DAYS = 60;

export const calendarUnavailableReason: string | null = isWeb
  ? "La synchronisation avec le calendrier se fait depuis l'app mobile."
  : isExpoGo
    ? "Expo Go n'a pas accès au calendrier : la synchronisation fonctionnera dans l'app installée (build de développement ou version publiée)."
    : null;

export const isCalendarSupported = calendarUnavailableReason === null;

async function getCalendarModule(): Promise<CalendarModule> {
  if (calendarUnavailableReason) throw new Error(calendarUnavailableReason);
  return import('expo-calendar');
}

async function ensurePermission(Calendar: CalendarModule) {
  // Accès complet (pas « écriture seule ») : il faut pouvoir créer le calendrier Regain et
  // relire ses événements pour les remplacer.
  const { status } = await Calendar.requestCalendarPermissions();
  if (status !== 'granted') {
    throw new Error("Autorisez l'accès au calendrier pour Regain dans les réglages de l'appareil.");
  }
}

async function createRegainCalendar(Calendar: CalendarModule): Promise<ExpoCalendar> {
  if (Platform.OS === 'ios') {
    // Le compte du calendrier par défaut (souvent iCloud) d'abord, pour que le calendrier
    // Regain suive l'utilisateur sur ses autres appareils ; le compte local en secours
    // (certains comptes, comme Exchange, refusent la création de calendriers).
    const sources = [
      Calendar.getDefaultCalendarSync().source,
      ...Calendar.getSourcesSync().filter((s) => s.type === Calendar.SourceType.LOCAL),
    ];
    let lastError: unknown = new Error('Aucun compte de calendrier disponible sur cet appareil.');
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

/** Retrouve le calendrier Regain par son identifiant mémorisé (un calendrier personnel du même
 *  nom n'est jamais touché), sinon le crée. */
async function getRegainCalendar(Calendar: CalendarModule, { create }: { create: boolean }): Promise<ExpoCalendar | null> {
  const savedId = await AsyncStorage.getItem(CALENDAR_ID_KEY).catch(() => null);
  if (savedId) {
    try {
      const calendar = await Calendar.ExpoCalendar.get(savedId);
      if (calendar.allowsModifications) return calendar;
    } catch {
      // Calendrier supprimé depuis l'app Calendrier : on en recrée un.
    }
  }
  if (!create) return null;

  const calendar = await createRegainCalendar(Calendar);
  await AsyncStorage.setItem(CALENDAR_ID_KEY, calendar.id).catch(() => {});
  return calendar;
}

/** Remplace les événements Regain de la semaine par le planning actuel. */
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

  // Les rappels Regain préviennent déjà 15 min avant : pas de double alerte.
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

/** Coupe la synchro et retire du calendrier les activités à venir (le passé reste). */
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

/** Appelé après chaque génération du planning ; ne fait rien si la synchro est coupée. */
export async function autoSyncWeekPlan(items: PlannedActivityRow[], availability: AvailabilitySlot[], weekStart: string) {
  if (!(await isCalendarAutoSyncEnabled())) return;
  await syncWeekPlanToCalendar(items, availability, weekStart);
}
