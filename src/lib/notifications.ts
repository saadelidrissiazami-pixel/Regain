import { Platform } from 'react-native';

import type { AvailabilitySlot } from '../features/availability/types';
import { trialReminderDate } from '../features/subscriptions/packages';
import { activityStartDate } from '../features/planning/schedule';
import type { PlannedActivityRow } from './planning';

const MORNING_NUDGE_ID = 'morning-nudge';
const WEEKLY_CHECKIN_ID = 'weekly-checkin';
const TRIAL_REMINDER_ID = 'trial-reminder';
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
      body: 'Before you scroll? Two minutes of breathing or stretching instead of a feed 🌱',
      data: { route: '/(tabs)/wellbeing' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 8, minute: 0 },
  });
  return true;
}

export async function isWeeklyCheckinReminderEnabled(): Promise<boolean> {
  if (!isSupported) return false;
  const Notifications = await getNotifications();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((n) => n.identifier === WEEKLY_CHECKIN_ID);
}

/**
 * The weekly check-in, once a week, Sunday evening.
 *
 * Sunday because the check-in is what adjusts the coming week's programme: asked on Sunday the
 * answer still changes something, asked on Wednesday it arrives halfway through.
 *
 * `weekday` is 1-7 with Sunday as 1 — the iOS DateComponents numbering, not JavaScript's. The
 * module validates the range and rejects 0, so a JS-style day silently becomes the wrong evening
 * or throws.
 */
export async function enableWeeklyCheckinReminder(): Promise<boolean> {
  if (!isSupported) return false;
  const Notifications = await getNotifications();
  configureHandler(Notifications);

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  await Notifications.cancelScheduledNotificationAsync(WEEKLY_CHECKIN_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: WEEKLY_CHECKIN_ID,
    content: {
      title: 'Regain',
      body: 'Five minutes on how the week went, and your coach adjusts the next one 📋',
      data: { route: '/fitness/checkin' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 1, hour: 18, minute: 0 },
  });
  return true;
}

export async function disableWeeklyCheckinReminder() {
  if (!isSupported) return;
  const Notifications = await getNotifications();
  await Notifications.cancelScheduledNotificationAsync(WEEKLY_CHECKIN_ID).catch(() => {});
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

// Only touches the current plan: called after each generation, and only when reminders are
// already on (permission is never asked for again here).
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
        body: `In ${REMINDER_LEAD_MINUTES} min: ${item.activities_catalog.title}`,
        data: { route: `/activity/${item.activities_catalog.id}` },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate },
    });
  }
}

/**
 * Warns before the Premium trial ends, so nobody discovers a yearly charge by surprise. How much
 * notice depends on the trial's length (see `trialReminderDaysBefore`).
 * A fixed identifier: one reminder only, replaced if it already exists.
 */
export async function scheduleTrialReminder(trialEnd: Date): Promise<boolean> {
  if (!isSupported) return false;
  const date = trialReminderDate(trialEnd, new Date());
  if (!date) return false;

  const Notifications = await getNotifications();
  configureHandler(Notifications);
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  // How much notice depends on the trial's length, so it is read back off the date chosen rather
  // than stated as a fixed delay — otherwise a reminder sent the day before would say “in 2 days”.
  const daysLeft = Math.round((trialEnd.getTime() - date.getTime()) / 86_400_000);
  const when = daysLeft <= 1 ? 'tomorrow' : `in ${daysLeft} days`;

  await Notifications.cancelScheduledNotificationAsync(TRIAL_REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: TRIAL_REMINDER_ID,
    content: {
      title: 'Regain Premium',
      body: `Your free trial ends ${when}. To avoid being charged, cancel from Profile → Settings → Manage my subscription.`,
      data: { route: '/(tabs)/profile' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
  return true;
}
