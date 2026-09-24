import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { goBack } from '../../lib/navigation';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Linking, Switch, View } from 'react-native';

import { errorMessage, InlineNotice } from '../../components/feedback';
import { Button, Card, ListRow, Screen, ScreenHeader, SegmentedControl, Text } from '../../components/ui';
import { fetchAvailabilitySlots } from '../../lib/availability';
import {
  calendarUnavailableReason,
  disableCalendarAutoSync,
  enableCalendarAutoSync,
  isCalendarAutoSyncEnabled,
} from '../../lib/deviceCalendar';
import { deleteAccount, exportUserData } from '../../lib/gdpr';
import { areRemindersEnabled, disableDailyReminder, enableDailyReminder, scheduleActivityReminders } from '../../lib/notifications';
import { fetchWeekPlan } from '../../lib/planning';
import { usePremium } from '../../lib/premium';
import { getManagementUrl, logOutPurchases } from '../../lib/purchases';
import { supabase } from '../../lib/supabase';
import { getWeekStart } from '../../lib/week';
import { useAuthStore } from '../../store/authStore';
import { useTheme, type ThemeMode } from '../../theme/ThemeProvider';

async function fetchCurrentWeek(userId: string) {
  const weekStart = getWeekStart();
  const [plan, availability] = await Promise.all([fetchWeekPlan(userId, weekStart), fetchAvailabilitySlots(userId)]);
  return { weekStart, plan, availability };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text variant="overline" tone="ink2" style={{ marginBottom: 8 }} accessibilityRole="header">
        {title}
      </Text>
      <Card padding={16}>{children}</Card>
    </View>
  );
}

/** Settings: appearance, reminders, calendar, subscription, data, signing out. */
export default function SettingsScreen() {
  const theme = useTheme();
  const session = useAuthStore((s) => s.session);
  const email = session?.user.email ?? '';
  const { isPremium, isDevUnlock } = usePremium();
  const queryClient = useQueryClient();

  const remindersQuery = useQuery({ queryKey: ['remindersEnabled'], queryFn: areRemindersEnabled });
  const toggleReminders = useMutation({
    mutationFn: async (next: boolean) => {
      if (next) {
        const granted = await enableDailyReminder();
        if (!granted) throw new Error('Allow notifications for Regain in your device settings.');
        if (session?.user.id) {
          const { plan, availability } = await fetchCurrentWeek(session.user.id);
          await scheduleActivityReminders(plan, availability);
        }
      } else {
        await disableDailyReminder();
      }
      return next;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['remindersEnabled'] }),
  });

  const calendarQuery = useQuery({ queryKey: ['calendarAutoSync'], queryFn: isCalendarAutoSyncEnabled });
  const toggleCalendar = useMutation({
    mutationFn: async (next: boolean): Promise<number | null> => {
      if (!next) {
        await disableCalendarAutoSync();
        return null;
      }
      const { weekStart, plan, availability } = await fetchCurrentWeek(session!.user.id);
      return enableCalendarAutoSync(plan, availability, weekStart);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['calendarAutoSync'] }),
  });

  const manageSubscription = useMutation({ mutationFn: async () => Linking.openURL(await getManagementUrl()) });

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const exportMutation = useMutation({ mutationFn: () => exportUserData(session!.user.id) });
  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.clear();
      router.replace('/');
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Without this clean-up, the previous account's data (catalogue, plan, RevenueCat Premium
    // entitlement) stays visible to the next account on the same device.
    await logOutPurchases().catch(() => {});
    queryClient.clear();
    router.replace('/');
  };

  const switchProps = { trackColor: { false: theme.line, true: theme.primary600 }, thumbColor: '#FFFFFF' };

  return (
    <Screen>
      <ScreenHeader title="Settings" subtitle={email} onBack={() => goBack('/(tabs)/profile')} />

      <Section title="Appearance">
        <SegmentedControl<ThemeMode>
          label="Appearance"
          tone="surface"
          value={theme.mode}
          onChange={theme.setMode}
          options={[
            { value: 'auto', label: 'Auto' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
        <Text variant="caption" tone="ink2" style={{ marginTop: 10 }}>
          On automatic, Regain follows your phone's light or dark setting.
        </Text>
      </Section>

      <Section title="Reminders and calendar">
        <ListRow
          icon="notifications-outline"
          title="Reminders"
          subtitle="A nudge at 8 am to pick breathing over scrolling, and a reminder when each activity is due."
          chevron={false}
          divider
          subtitleLines={4}
          right={
            <Switch
              value={!!remindersQuery.data}
              onValueChange={(v) => toggleReminders.mutate(v)}
              disabled={remindersQuery.isLoading || toggleReminders.isPending}
              accessibilityLabel="Reminders"
              {...switchProps}
            />
          }
        />
        {toggleReminders.isError ? <InlineNotice tone="error" message={errorMessage(toggleReminders.error)} /> : null}
        <ListRow
          icon="calendar-outline"
          title="Calendar"
          subtitle={
            calendarUnavailableReason ??
            'Automatically adds each plan to a “Regain” calendar, at the times you are free.'
          }
          chevron={false}
          subtitleLines={4}
          right={
            calendarUnavailableReason ? null : toggleCalendar.isPending ? (
              <ActivityIndicator color={theme.primary600} />
            ) : (
              <Switch
                value={!!calendarQuery.data}
                onValueChange={(v) => toggleCalendar.mutate(v)}
                disabled={calendarQuery.isLoading}
                accessibilityLabel="Sync the calendar"
                {...switchProps}
              />
            )
          }
        />
        {toggleCalendar.isError ? <InlineNotice tone="error" message={errorMessage(toggleCalendar.error)} /> : null}
        {toggleCalendar.isSuccess && toggleCalendar.data !== null ? (
          <InlineNotice
            tone="success"
            message={`${toggleCalendar.data} activit${toggleCalendar.data > 1 ? 'ies' : 'y'} from this week added${
              toggleCalendar.data > 1 ? 's' : ''
            }. Les prochains plannings suivront automatiquement.`}
          />
        ) : null}
        {toggleCalendar.isSuccess && toggleCalendar.data === null ? (
          <InlineNotice message="Syncing is off: upcoming activities have been removed from the calendar." />
        ) : null}
      </Section>

      <Section title="Subscription">
        <Text variant="label">{isPremium ? 'Regain Premium' : 'Free plan'}</Text>
        {isDevUnlock ? (
          <>
            <Text variant="caption" tone="ink2" style={{ marginTop: 4 }}>
              Unlocked for development. Purchases are unavailable here; a production build will ask for a real subscription.
            </Text>
            <Button label="See the subscription screen" variant="outline" size="md" onPress={() => router.push('/paywall')} style={{ marginTop: 12 }} />
          </>
        ) : isPremium ? (
          <>
            <Text variant="caption" tone="ink2" style={{ marginTop: 4 }}>
              Change or cancel your subscription any time from your App Store / Google Play account.
            </Text>
            <Button
              label="Manage my subscription"
              variant="outline"
              size="md"
              loading={manageSubscription.isPending}
              onPress={() => manageSubscription.mutate()}
              style={{ marginTop: 12 }}
            />
          </>
        ) : (
          <>
            <Text variant="caption" tone="ink2" style={{ marginTop: 4 }}>
              Go Premium for the fitness coach and the whole wellbeing library.
            </Text>
            <Button label="See what Premium adds" size="md" onPress={() => router.push('/paywall')} style={{ marginTop: 12 }} />
          </>
        )}
      </Section>

      <Section title="Privacy">
        <Text variant="caption" tone="ink2">
          Notifications, calendar and location stay optional: they only turn on if you allow them,
          and they turn off here or in your device settings.
        </Text>
        <Button
          label="Export my data"
          variant="outline"
          size="md"
          icon="download-outline"
          loading={exportMutation.isPending}
          onPress={() => exportMutation.mutate()}
          style={{ marginTop: 12 }}
        />
        {exportMutation.isError ? <InlineNotice tone="error" message={errorMessage(exportMutation.error)} /> : null}

        {confirmingDelete ? (
          <View style={{ marginTop: 14, borderRadius: 14, padding: 14, backgroundColor: theme.fat }}>
            <Text variant="bodySm">Permanently delete your account and all your data? This cannot be undone.</Text>
            {isPremium && !isDevUnlock ? (
              <Text variant="caption" tone="ink2" style={{ marginTop: 6 }}>
                Deleting the account does not cancel the subscription — cancel it from “Manage my subscription”.
              </Text>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <Button
                label="Delete permanently"
                variant="destructive"
                size="md"
                fullWidth={false}
                loading={deleteMutation.isPending}
                onPress={() => deleteMutation.mutate()}
              />
              <Button label="Cancel" variant="ghost" size="md" fullWidth={false} onPress={() => setConfirmingDelete(false)} />
            </View>
            {deleteMutation.isError ? <InlineNotice tone="error" message={errorMessage(deleteMutation.error)} /> : null}
          </View>
        ) : (
          <Button label="Delete my account" variant="ghost" size="md" onPress={() => setConfirmingDelete(true)} style={{ marginTop: 4 }} />
        )}
      </Section>

      <Button label="Sign out" variant="outline" icon="log-out-outline" onPress={handleSignOut} />
    </Screen>
  );
}
