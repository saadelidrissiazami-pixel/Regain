import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { EnergyPromptCard } from '../../components/cards/EnergyPromptCard';
import { NextUpCard } from '../../components/cards/NextUpCard';
import { NowCard } from '../../components/cards/NowCard';
import { WeekProgressCard } from '../../components/cards/WeekProgressCard';
import { EmptyState, ErrorState, errorMessage, InlineNotice, LoadingSkeleton } from '../../components/feedback';
import { Appear, Avatar, Button, Card, ListRow, PressableScale, Screen, ScreenHeader, SectionHeader, Sheet } from '../../components/ui';
import { formatCountdown, greetingFor, isOver, minutesUntil, coachLine } from '../../features/planning/weekView';
import { useCommitments } from '../../hooks/useCommitments';
import { usePlanning } from '../../hooks/usePlanning';
import { formatDayLabel } from '../../lib/formatDate';
import type { PlannedActivityRow } from '../../lib/planning';
import { firstNameOf } from '../../lib/profile';
import { relativeDayLabel } from '../../features/fitness/schedule';
import { useAuthStore } from '../../store/authStore';
import { activityReason } from './reason';
import { t } from '../../lib/i18n';

/** Home: “What should I be doing now?” */
export default function PlanningHomeScreen() {
  const planning = usePlanning();
  const commitments = useCommitments();
  const email = useAuthStore((s) => s.session?.user.email ?? '');
  const { today, view, planQuery, availabilityQuery, generateMutation, startOf } = planning;
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
  const next = active[0];
  const after = active[1];
  // Three sessions at most — the home screen suggests, it does not recite the week's diary —
  // but the shopping is kept whatever happens. Taking a flat first three dropped it off the
  // list on any week with three sessions ahead of it, and it is the one commitment the week's
  // meals depend on.
  const pending = commitments.filter((engagement) => engagement.status === 'a_faire');
  const shopping = pending.filter((engagement) => engagement.kind === 'courses');
  const aVenir = [...pending.filter((engagement) => engagement.kind !== 'courses').slice(0, 3), ...shopping.slice(0, 1)].sort(
    (a, b) => a.date.localeCompare(b.date)
  );
  const pendingToday = active.filter((item) => item.date === today).length;

  const name = firstNameOf(planning.profile);
  const whenOf = (item: PlannedActivityRow) => {
    const start = startOf(item);
    if (item.date === today) {
      const countdown = formatCountdown(minutesUntil(item.date, start, now));
      return [start, countdown ?? t('in progress')].join(' · ');
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
          <PressableScale onPress={() => router.navigate('/(tabs)/profile')} accessibilityRole="button" accessibilityLabel={t('My profile')}>
            <Avatar name={name ?? email} size={44} />
          </PressableScale>
        }
      />

      {/* Setting the week up belongs where the week is read, not at the foot of the page after
          everything it produced. */}
      <Appear index={0}>
        <Card variant="flat" padding={4} style={{ marginBottom: 16 }}>
          <View style={{ paddingHorizontal: 12 }}>
            <ListRow icon="time-outline" title={t('When I am free')} onPress={() => router.push('/availability')} divider={hasPlan} compact />
            {hasPlan ? (
              <ListRow
                icon="refresh-outline"
                title={t('Rebuild my week')}
                subtitle={t('Activities already done stay where they are.')}
                onPress={() => setConfirmRegenerate(true)}
                compact
              />
            ) : null}
          </View>
        </Card>
      </Appear>

      <Appear index={1}>
        <EnergyPromptCard />
      </Appear>

      <View style={{ height: 16 }} />

      {loading ? (
        <LoadingSkeleton preset="hero" />
      ) : planQuery.isError ? (
        <ErrorState
          title={t('Your plan could not be loaded')}
          onRetry={() => planQuery.refetch()}
          retrying={planQuery.isFetching}
        />
      ) : !hasPlan ? (
        <Appear index={1}>
          {hasAvailability ? (
            <EmptyState
              icon="sparkles-outline"
              title={t('Shall we prepare your week?')}
              body={t('Regain places activities into the times you are free, around your energy and your goals.')}
              actionLabel={t('Prepare my week')}
              onAction={() => generateMutation.mutate()}
              actionLoading={generateMutation.isPending}
            />
          ) : (
            <EmptyState
              icon="time-outline"
              title={t('Start with when you are free')}
              body={t('Tell Regain when you are free, and it suggests what to do, at the right time.')}
              actionLabel={t('Add my free times')}
              onAction={() => router.push('/availability')}
            />
          )}
          {generateMutation.isError ? <InlineNotice tone="error" message={errorMessage(generateMutation.error)} /> : null}
        </Appear>
      ) : next ? (
        <Appear index={1}>
          <NowCard
            key={next.id}
            label={next.date === today ? t('Now') : t('Up next')}
            when={whenOf(next)}
            activity={next.activities_catalog}
            reason={activityReason(next.activities_catalog, planning.preferences)}
            done={false}
            toggling={planning.isToggling(next)}
            onToggle={() => planning.toggle(next)}
            onStart={() => router.push(`/activity/${next.activities_catalog.id}`)}
          />
        </Appear>
      ) : (
        <Appear index={1}>
          <EmptyState
            icon={allDone ? 'trophy-outline' : 'moon-outline'}
            title={allDone ? t('Everything is done for this week') : t('Nothing else planned before the week is out')}
            body={
              allDone
                ? t('Well done. See what you got through in Tracking.')
                : t('Enjoy the free time, or add an activity if you feel like it.')
            }
            actionLabel={allDone ? t('See my progress') : t('Add an activity')}
            onAction={() => (allDone ? router.navigate('/(tabs)/tracking') : router.push('/planning/add'))}
          />
        </Appear>
      )}

      {after ? (
        <Appear index={3}>
          <View style={{ marginTop: 28 }}>
            <SectionHeader title={t('Later this week')} actionLabel={t('See the week')} onAction={() => router.push('/planning/week')} />
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
            <SectionHeader title={t('Your commitments')} actionLabel={t('My fitness')} onAction={() => router.push('/(tabs)/fitness')} />
            {aVenir.map((engagement, index) => (
              <ListRow
                key={engagement.id}
                icon={engagement.kind === 'courses' ? 'cart-outline' : 'barbell-outline'}
                title={engagement.title}
                subtitle={[
                  relativeDayLabel(engagement.date, today, formatDayLabel),
                  engagement.startTime,
                  t('{minutes} min', { minutes: engagement.durationMinutes }),
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

      {generateMutation.isError && hasPlan ? <InlineNotice tone="error" message={errorMessage(generateMutation.error)} /> : null}
      {generateMutation.isSuccess && hasPlan ? <InlineNotice tone="success" message={t('Your week has been adapted.')} /> : null}

      <Sheet
        visible={confirmRegenerate}
        title={t('Rebuild your week?')}
        subtitle={t('Regain suggests new activities. The ones you have already done stay where they are.')}
        onClose={() => setConfirmRegenerate(false)}
        scroll={false}
        footer={
          <View style={{ gap: 8 }}>
            <Button
              label={t('Rebuild')}
              icon="refresh"
              loading={generateMutation.isPending}
              onPress={() => generateMutation.mutate(undefined, { onSettled: () => setConfirmRegenerate(false) })}
            />
            <Button label={t('Cancel')} variant="ghost" onPress={() => setConfirmRegenerate(false)} />
          </View>
        }
      >
        <View />
      </Sheet>
    </Screen>
  );
}
