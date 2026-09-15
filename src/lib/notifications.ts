import { Platform } from 'react-native';

import type { AvailabilitySlot } from '../features/availability/types';
import { activityStartDate } from '../features/planning/schedule';
import type { PlannedActivityRow } from './planning';

const MORNING_NUDGE_ID = 'morning-nudge';
const ACTIVITY_PREFIX = 'activity-';
const REMINDER_LEAD_MINUTES = 15;

const isSupported = Platform.OS !== 'web';

async function getNotifications() {
  const module = await import('expo-notifications');
  return module;
}

function configureHandler(Notifications: Awaited<ReturnType<typeof getNotifications>>) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function areRemindersEnabled(): Promise<boolean> {
  if (!isSupported) return false;
  const Notifications = await getNotifications();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((n) => n.identifier === MORNING_NUDGE_ID);
}

export async function enableDailyReminder(): Promise<boolean> {
  if (!isSupported) return false;
  const Notifications = await getNotifications();
  configureHandler(Notifications);

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  await Notifications.cancelScheduledNotificationAsync(MORNING_NUDGE_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: MORNING_NUDGE_ID,
    content: {
      title: 'Regain',
      body: 'Avant de scroller ? Deux minutes de respiration ou d’étirement plutôt qu’un réseau social 🌱',
      data: { route: '/(tabs)/wellbeing' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 8, minute: 0 },
  });
  return true;
}

export async function disableDailyReminder() {
  if (!isSupported) return;
  const Notifications = await getNotifications();
  await Notifications.cancelScheduledNotificationAsync(MORNING_NUDGE_ID).catch(() => {});
  await cancelActivityReminders();
}

export async function cancelActivityReminders() {
  if (!isSupported) return;
  const Notifications = await getNotifications();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(ACTIVITY_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {}))
  );
}

// N'affecte que le planning courant : appelé après chaque génération, seulement si les
// rappels sont déjà activés (on ne redemande jamais la permission ici).
export async function scheduleActivityReminders(items: PlannedActivityRow[], availability: AvailabilitySlot[] = []) {
  if (!isSupported) return;
  if (!(await areRemindersEnabled())) return;

  const Notifications = await getNotifications();
  configureHandler(Notifications);
  await cancelActivityReminders();

  const now = new Date();
  for (const item of items) {
    if (item.status === 'realise') continue;
    const activityDate = activityStartDate(item, availability);

    const reminderDate = new Date(activityDate.getTime() - REMINDER_LEAD_MINUTES * 60_000);
    if (reminderDate <= now) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: `${ACTIVITY_PREFIX}${item.id}`,
      content: {
        title: 'Regain',
        body: `Dans ${REMINDER_LEAD_MINUTES} min : ${item.activities_catalog.title}`,
        data: { route: `/activity/${item.activities_catalog.id}` },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate },
    });
  }
}
