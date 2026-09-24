import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { EnergyPromptCard } from '../../components/cards/EnergyPromptCard';
import { EnergySelector } from '../../components/cards/EnergySelector';
import { NextUpCard } from '../../components/cards/NextUpCard';
import { NowCard } from '../../components/cards/NowCard';
import { WeekProgressCard } from '../../components/cards/WeekProgressCard';
import { EmptyState, ErrorState, errorMessage, InlineNotice, LoadingSkeleton } from '../../components/feedback';
import { Appear, Avatar, Button, Card, ListRow, PressableScale, Screen, ScreenHeader, SectionHeader, Sheet, Text } from '../../components/ui';
import { formatCountdown, greetingFor, isOver, minutesUntil, coachLine } from '../../features/planning/weekView';
import { useCommitments } from '../../hooks/useCommitments';
import { useEnergyToday } from '../../hooks/useEnergyToday';
import { usePlanning } from '../../hooks/usePlanning';
import { calendarUnavailableReason } from '../../lib/deviceCalendar';
import { formatDayLabel } from '../../lib/formatDate';
import type { PlannedActivityRow } from '../../lib/planning';
import { firstNameOf } from '../../lib/profile';
import { relativeDayLabel } from '../../features/fitness/schedule';
import { useAuthStore } from '../../store/authStore';
import { activityReason } from './reason';

/** Home: “What should I be doing now?” */
export default function PlanningHomeScreen() {
  const planning = usePlanning();
  const commitments = useCommitments();
  const energy = useEnergyToday();
  const email = useAuthStore((s) => s.session?.user.email ?? '');
  const { today, view, planQuery, availabilityQuery, generateMutation, calendarSyncMutation, startOf } = planning;
  const [now] = useState(() => new Date());
  const hour = now.getHours();
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const hasAvailability = planning.availability.length > 0;
  const hasPlan = view.totalCount > 0;
  const allDone = hasPlan && view.doneCount === view.totalCount;

  // Upcoming activities sorted by day then by time. Anything already over today but unticked
  // cannot be “now”: it is still to be ticked off from the week.
  const upcoming = view.upcomingDays.flatMap(({ items }) => [...items].sort((a, b) => startOf(a).localeCompare(startOf(b))));
  const over = (item: PlannedActivityRow) =>
    item.date === today && isOver(item.date, startOf(item), item.activities_catalog.duration_minutes, now);
  const active = upcoming.filter((item) => !over(item));
  const toCheck = upcoming.filter(over).length + view.pastPending.length;
  const next = active[0];
  const after = active[1];
  // Three at most: the home screen suggests, it does not recite the week's diary.
  const aVenir = commitments.filter((engagement) => engagement.status === 'a_faire').slice(0, 3);
  const pendingToday = active.filter((item) => item.date === today).length;

  const name = firstNameOf(planning.profile);
  const whenOf = (item: PlannedActivityRow) => {
    const start = startOf(item);
    if (item.date === today) {
      const countdown = formatCountdown(minutesUntil(item.date, start, now));
      return [start, countdown ?? 'in progress'].join(' · ');
    }
    return `${relativeDayLabel(item.date, today, formatDayLabel)} · ${start}`;
  };

  const loading = planQuery.isLoading || availabilityQuery.isLoading;

  return (
    <Screen inTabs refreshing={planning.refreshing} onRefresh={planning.refresh}>
      <ScreenHeader
        overline={formatDayLabel(today)}
        title={`${greetingFor(hour)}${name ? `, ${name}` : ''} 👋`}
        subtitle={coachLine({ hasPlan, doneCount: view.doneCount, totalCount: view.totalCount, pendingToday, hour })}
        size="display"
        right={
          <PressableScale onPress={() => router.navigate('/(tabs)/profile')} accessibilityRole="button" accessibilityLabel="My profile">
            <Avatar name={name ?? email} size={44} />
          </PressableScale>
        }
      />

      <Appear index={0}>
        <EnergyPromptCard />
      </Appear>

      <View style={{ height: 16 }} />

      {loading ? (
        <LoadingSkeleton preset="hero" />
      ) : planQuery.isError ? (
        <ErrorState
          title="Your plan could not be loaded"
          onRetry={() => planQuery.refetch()}
          retrying={planQuery.isFetching}
        />
      ) : !hasPlan ? (
        <Appear index={1}>
          {hasAvailability ? (
            <EmptyState
              icon="sparkles-outline"
              title="Shall we prepare your week?"
              body="Regain places activities into the times you are free, around your energy and your goals."
              actionLabel="Prepare my week"
              onAction={() => generateMutation.mutate()}
              actionLoading={generateMutation.isPending}
            />
          ) : (
            <EmptyState
              icon="time-outline"
              title="Start with when you are free"
              body="Tell Regain when you are free, and it suggests what to do, at the right time."
              actionLabel="Add my free times"
              onAction={() => router.push('/availability')}
            />
          )}
          {generateMutation.isError ? <InlineNotice tone="error" message={errorMessage(generateMutation.error)} /> : null}
        </Appear>
      ) : next ? (
        <Appear index={1}>
          <NowCard
            key={next.id}
            label={next.date === today ? 'Now' : 'Up next'}
            when={whenOf(next)}
            activity={next.activities_catalog}
            reason={activityReason(next.activities_catalog, planning.preferences)}
            done={false}
            toggling={planning.isToggling(next)}
            onToggle={() => planning.toggle(next)}
            onStart={() => router.push(`/activity/${next.activities_catalog.id}`)}
            footer={
              <>
                <Text variant="label" style={{ marginBottom: 10 }}>
                  How are you feeling right now?
                </Text>
                <EnergySelector value={energy.level} onChange={energy.save} savingLevel={energy.savingLevel} disabled={energy.saving} />
              </>
            }
          />
        </Appear>
      ) : (
        <Appear index={1}>
          <EmptyState
            icon={allDone ? 'trophy-outline' : 'moon-outline'}
            title={allDone ? 'Everything is done for this week' : 'Nothing else planned before the week is out'}
            body={
              allDone
                ? 'Well done. See what you got through in Tracking.'
                : 'Enjoy the free time, or add an activity if you feel like it.'
            }
            actionLabel={allDone ? 'See my progress' : 'Add an activity'}
            onAction={() => (allDone ? router.navigate('/(tabs)/tracking') : router.push('/planning/add'))}
          />
        </Appear>
      )}

      {toCheck > 0 && hasPlan ? (
        <Appear index={2}>
          <Card variant="flat" padding={4} style={{ marginTop: 12 }}>
            <View style={{ paddingHorizontal: 12 }}>
              <ListRow
                icon="checkmark-done-outline"
                title={`${toCheck} activit${toCheck > 1 ? 'ies' : 'y'} to tick off`}
                subtitle="Already done? Tick it off from your week."
                onPress={() => router.push('/planning/week')}
                compact
              />
            </View>
          </Card>
        </Appear>
      ) : null}

      {after ? (
        <Appear index={3}>
          <View style={{ marginTop: 28 }}>
            <SectionHeader title="Up next" actionLabel="See the week" onAction={() => router.push('/planning/week')} />
            <NextUpCard
              when={whenOf(after)}
              activity={after.activities_catalog}
              onPress={() => router.push(`/activity/${after.activities_catalog.id}`)}
            />
          </View>
        </Appear>
      ) : null}

      {hasPlan ? (
        <Appear index={4}>
          <View style={{ marginTop: after ? 16 : 28 }}>
            <WeekProgressCard done={view.doneCount} total={view.totalCount} onPress={() => router.push('/planning/week')} />
          </View>
        </Appear>
      ) : null}

      {/* Sessions and shopping: what the person committed to, as opposed to the activities
          suggested above, which can be ignored at no cost. Only what is still ahead is shown —
          a past day with nothing ticked does not turn into a reproach. */}
      {aVenir.length > 0 ? (
        <Appear index={5}>
          <View style={{ marginTop: 28 }}>
            <SectionHeader title="Your commitments" actionLabel="My fitness" onAction={() => router.push('/(tabs)/fitness')} />
            {aVenir.map((engagement, index) => (
              <ListRow
                key={engagement.id}
                icon={engagement.kind === 'courses' ? 'cart-outline' : 'barbell-outline'}
                title={engagement.title}
                subtitle={[
                  relativeDayLabel(engagement.date, today, formatDayLabel),
                  engagement.startTime,
                  `${engagement.durationMinutes} min`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                onPress={() => router.push(engagement.href)}
                divider={index < aVenir.length - 1}
              />
            ))}
          </View>
        </Appear>
      ) : null}

      {/* Secondary actions: reachable, without competing with the action of the moment. */}
      <Appear index={6}>
        <View style={{ marginTop: 32 }}>
          <Text variant="overline" tone="ink2" style={{ marginBottom: 4 }}>
            Organise my week
          </Text>
          <ListRow icon="calendar-outline" title="See the whole week" onPress={() => router.push('/planning/week')} divider compact />
          <ListRow icon="time-outline" title="When I am free" onPress={() => router.push('/availability')} divider compact />
          {hasPlan ? (
            <ListRow
              icon="refresh-outline"
              title="Rebuild my week"
              subtitle="Activities already done stay where they are."
              onPress={() => setConfirmRegenerate(true)}
              divider
              compact
            />
          ) : null}
          {hasPlan && !calendarUnavailableReason ? (
            <ListRow
              icon="sync-outline"
              title={calendarSyncMutation.isPending ? 'Syncing…' : 'Sync with my calendar'}
              onPress={() => calendarSyncMutation.mutate()}
              compact
              chevron={false}
            />
          ) : null}
          {hasPlan && calendarUnavailableReason ? (
            <Text variant="caption" tone="ink2" style={{ marginTop: 8 }}>
              {calendarUnavailableReason}
            </Text>
          ) : null}
          {calendarSyncMutation.isError ? <InlineNotice tone="error" message={errorMessage(calendarSyncMutation.error)} /> : null}
          {calendarSyncMutation.isSuccess ? (
            <InlineNotice
              tone="success"
              message={`${calendarSyncMutation.data} activit${
                calendarSyncMutation.data > 1 ? 'ies' : 'y'
              } added to the “Regain” calendar.`}
            />
          ) : null}
          {hasPlan && generateMutation.isError ? <InlineNotice tone="error" message={errorMessage(generateMutation.error)} /> : null}
          {hasPlan && generateMutation.isSuccess ? <InlineNotice tone="success" message="Your week has been adapted." /> : null}
        </View>
      </Appear>

      <Sheet
        visible={confirmRegenerate}
        title="Rebuild your week?"
        subtitle="Regain suggests new activities. The ones you have already done stay where they are."
        onClose={() => setConfirmRegenerate(false)}
        scroll={false}
        footer={
          <View style={{ gap: 8 }}>
            <Button
              label="Rebuild"
              icon="refresh"
              loading={generateMutation.isPending}
              onPress={() => generateMutation.mutate(undefined, { onSettled: () => setConfirmRegenerate(false) })}
            />
            <Button label="Cancel" variant="ghost" onPress={() => setConfirmRegenerate(false)} />
          </View>
        }
      >
        <View />
      </Sheet>
    </Screen>
  );
}
