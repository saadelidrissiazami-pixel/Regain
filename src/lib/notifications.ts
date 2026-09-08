import { Platform } from 'react-native';

const REMINDER_ID_KEY = 'daily-reminder';
const isSupported = Platform.OS !== 'web';

async function getNotifications() {
  const module = await import('expo-notifications');
  return module;
}

export async function areRemindersEnabled(): Promise<boolean> {
  if (!isSupported) return false;
  const Notifications = await getNotifications();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((n) => n.identifier === REMINDER_ID_KEY);
}

export async function enableDailyReminder(): Promise<boolean> {
  if (!isSupported) return false;
  const Notifications = await getNotifications();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID_KEY).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID_KEY,
    content: {
      title: 'Regain',
      body: 'Une activité vous attend dans votre semaine, quand vous serez prêt·e 🌱',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 9, minute: 0 },
  });
  return true;
}

export async function disableDailyReminder() {
  if (!isSupported) return;
  const Notifications = await getNotifications();
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID_KEY).catch(() => {});
}
