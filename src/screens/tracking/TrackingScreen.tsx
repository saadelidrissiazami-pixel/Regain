import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { MiniBars, StatCard } from '../../components/cards/StatCard';
import { TargetsCard } from '../../components/cards/TargetsCard';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback';
import {
  Appear,
  Card,
  ListRow,
  PressableScale,
  ProgressBar,
  Screen,
  ScreenHeader,
  SectionHeader,
  SegmentedControl,
  Tag,
  Text,
  TextLink,
} from '../../components/ui';
import { formatSleep } from '../../features/onboarding/options';
import { CATEGORY_COLORS, CATEGORY_LABELS, type ActivityCategory } from '../../features/planning/types';
import { averageMood, moodOption } from '../../features/wellbeing/reflection';
import { average, dailyAverages, energyLabel, lastDays, moodLabel, percentChange, splitWeeks } from '../../features/tracking/insights';
import { useFitness } from '../../hooks/useFitness';
import { fetchEnergyCheckins } from '../../lib/energyCheckin';
import { formatDayLabel } from '../../lib/formatDate';
import { fetchCompletedActivities, markActivityUndone } from '../../lib/planning';
import { fetchSleepMinutes } from '../../lib/profile';
import { fetchStreak, fetchWeekStats } from '../../lib/tracking';
import { useToday, useWeekStart } from '../../lib/useCurrentDate';
import { fetchWellbeingJournal } from '../../lib/wellbeing';
import { t } from '../../lib/i18n';
import { fromLocalISODate } from '../../lib/week';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeProvider';

type Tab = 'overview' | 'fitness' | 'wellbeing' | 'nutrition';
// Indexed by Date.getDay(), so Sunday comes first. One key, because the initials only make
// sense as a set: French starts the same list at “D” for dimanche.
const DAY_LETTERS = t('S,M,T,W,T,F,S').split(',');

/** Tracking: “Am I making progress?” */
export default function TrackingScreen() {
  const theme = useTheme();
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const weekStart = useWeekStart();
  const today = useToday();
  const fitness = useFitness();
  const [tab, setTab] = useState<Tab>('overview');
  const [showAllHistory, setShowAllHistory] = useState(false);

  const statsQuery = useQuery({ queryKey: ['trackingStats', userId, weekStart], queryFn: () => fetchWeekStats(userId!, weekStart), enabled: !!userId });
  const streakQuery = useQuery({ queryKey: ['streak', userId], queryFn: () => fetchStreak(userId!), enabled: !!userId });
  const historyQuery = useQuery({ queryKey: ['completedActivities', userId], queryFn: () => fetchCompletedActivities(userId!), enabled: !!userId });
  const journalQuery = useQuery({ queryKey: ['wellbeingJournal', userId], queryFn: () => fetchWellbeingJournal(userId!, 30), enabled: !!userId });
  const sleepQuery = useQuery({ queryKey: ['sleepMinutes', userId], queryFn: () => fetchSleepMinutes(userId!), enabled: !!userId });
  const energyQuery = useQuery({
    queryKey: ['energyHistory', userId, today],
    queryFn: () => {
      const since = fromLocalISODate(lastDays(today, 14)[0]);
      return fetchEnergyCheckins(userId!, since.toISOString());
    },
    enabled: !!userId,
  });

  const undoMutation = useMutation({
    mutationFn: (plannedActivityId: string) => markActivityUndone(userId!, plannedActivityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completedActivities', userId] });
      queryClient.invalidateQueries({ queryKey: ['weekPlan', userId] });
      queryClient.invalidateQueries({ queryKey: ['trackingStats', userId] });
      queryClient.invalidateQueries({ queryKey: ['streak', userId] });
    },
  });

  const refreshing = statsQuery.isRefetching;
  const refresh = () => {
    statsQuery.refetch();
    streakQuery.refetch();
    historyQuery.refetch();
    journalQuery.refetch();
    energyQuery.refetch();
    sleepQuery.refetch();
  };

  const stats = statsQuery.data;
  const streak = streakQuery.data ?? 0;
  const days7 = lastDays(today, 7);
  const dayLetters = days7.map((d) => DAY_LETTERS[fromLocalISODate(d).getDay()]);

  // Energy: check-ins (1-5), this week's average and the comparison with last week's.
  const energySamples = (energyQuery.data ?? []).map((r) => ({ at: r.checkin_at, value: r.energy_level }));
  const energyWeeks = splitWeeks(energySamples, today);
  const energyAvg = average(energyWeeks.current);
  const energyDelta = percentChange(energyAvg, average(energyWeeks.previous));
  const energyBars = dailyAverages(energySamples, days7);

  // Mood: the rating given at the end of wellbeing sessions.
  const moodSamples = (journalQuery.data ?? []).filter((e) => typeof e.mood === 'number').map((e) => ({ at: e.completed_at, value: e.mood as number }));
  const moodWeeks = splitWeeks(moodSamples, today);
  const moodAvg = average(moodWeeks.current) ?? average(moodSamples.slice(0, 10).map((s) => s.value));
  const moodDelta = percentChange(average(moodWeeks.current), average(moodWeeks.previous));
  const moodBars = dailyAverages(moodSamples, days7);

  const categoryEntries = Object.entries(stats?.minutesByCategory ?? {}) as [ActivityCategory, number][];
  const maxMinutes = Math.max(1, ...categoryEntries.map(([, minutes]) => minutes));
  const history = historyQuery.data ?? [];
  const shownHistory = showAllHistory ? history : history.slice(0, 5);

  const overview = (
    <>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatCard
          icon="checkmark-done-outline"
          title={t('Activities this week')}
          value={stats ? `${stats.completedCount} / ${stats.totalCount}` : '–'}
          caption={stats && stats.totalCount > 0 ? `${Math.round((stats.completedCount / stats.totalCount) * 100)}%` : t('No plan yet')}
          onPress={() => router.push('/planning/week')}
        >
          <ProgressBar progress={stats && stats.totalCount > 0 ? stats.completedCount / stats.totalCount : 0} height={6} />
        </StatCard>
        <StatCard
          icon="flash-outline"
          iconColor={theme.orange}
          title={t('Average energy')}
          value={energyAvg === null ? '–' : `${energyLabel(energyAvg).emoji} ${energyLabel(energyAvg).label}`}
          delta={energyDelta}
          caption={energyAvg === null ? t('Answer today’s check-in') : undefined}
        >
          <MiniBars values={energyBars} max={5} labels={dayLetters} color={theme.orange} />
        </StatCard>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <StatCard
          icon="moon-outline"
          iconColor={theme.purple}
          title={t('Sleep')}
          value={sleepQuery.data ? formatSleep(sleepQuery.data) : '–'}
          caption={sleepQuery.data ? t('Your usual amount') : t('Tell us your usual amount')}
          onPress={() => router.push('/profile/goals')}
        />
        <StatCard
          icon="happy-outline"
          iconColor={theme.yellow}
          title={t('Mood after your sessions')}
          value={moodAvg === null ? '–' : moodLabel(moodAvg)}
          delta={moodDelta}
          caption={moodAvg === null ? t('Note how you feel at the end of a session') : undefined}
        >
          <MiniBars values={moodBars} max={5} labels={dayLetters} color={theme.yellow} />
        </StatCard>
      </View>

      <Card style={{ marginTop: 16 }} padding={16}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.carbs, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="flame" size={20} color={theme.orange} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="label">
              {streak > 0
                ? streak > 1
                  ? t('{count} days in a row', { count: streak })
                  : t('{count} day in a row', { count: streak })
                : t('Your streak starts today')}
            </Text>
            <Text variant="caption" tone="ink2">
              {streak >= 2 ? t('Keep going at your own pace.') : t('One activity ticked a day is enough to grow it.')}
            </Text>
          </View>
        </View>
      </Card>

      <View style={{ marginTop: 28 }}>
        <SectionHeader title={t('Time by category')} subtitle={t('What you got through this week')} />
        {statsQuery.isLoading ? (
          <LoadingSkeleton preset="list" />
        ) : categoryEntries.length === 0 ? (
          <Text variant="bodySm" tone="ink2">
            {t('Nothing ticked off this week yet — tick your activities from the plan.')}
          </Text>
        ) : (
          <Card>
            {categoryEntries.map(([category, minutes], i) => (
              <View key={category} style={{ marginBottom: i === categoryEntries.length - 1 ? 0 : 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text variant="label">{CATEGORY_LABELS[category]}</Text>
                  <Text variant="caption" tone="ink2" tabular>
                    {t('{minutes} min', { minutes })}
                  </Text>
                </View>
                <ProgressBar progress={minutes / maxMinutes} color={CATEGORY_COLORS[category]} delay={120 + i * 80} height={6} />
              </View>
            ))}
          </Card>
        )}
      </View>

      <View style={{ marginTop: 28 }}>
        <SectionHeader title={t('History')} />
        {historyQuery.isLoading ? (
          <LoadingSkeleton preset="list" />
        ) : history.length === 0 ? (
          <Text variant="bodySm" tone="ink2">
            {t('Nothing ticked off yet.')}
          </Text>
        ) : (
          <>
            {shownHistory.map((item) => (
              <Card key={item.id} padding={14} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text variant="label">{item.activities_catalog.title}</Text>
                    <View style={{ marginTop: 4 }}>
                      <Tag
                        label={CATEGORY_LABELS[item.activities_catalog.category]}
                        color={CATEGORY_COLORS[item.activities_catalog.category]}
                        suffix={formatDayLabel(item.date)}
                      />
                    </View>
                  </View>
                  <PressableScale
                    onPress={() => undoMutation.mutate(item.id)}
                    disabled={undoMutation.isPending}
                    accessibilityRole="button"
                    accessibilityLabel={t('Undo “{title}”', { title: item.activities_catalog.title })}
                    style={{ minHeight: 44, minWidth: 64, alignItems: 'center', justifyContent: 'center' }}
                  >
                    {undoMutation.isPending && undoMutation.variables === item.id ? (
                      <ActivityIndicator size="small" color={theme.primary600} />
                    ) : (
                      <Text variant="label" tone="ink2">
                        {t('Undo')}
                      </Text>
                    )}
                  </PressableScale>
                </View>
              </Card>
            ))}
            {history.length > 5 ? (
              <TextLink
                label={showAllHistory ? t('Show less') : t('See all {count} activities', { count: history.length })}
                icon={showAllHistory ? 'chevron-up' : 'chevron-down'}
                onPress={() => setShowAllHistory((v) => !v)}
              />
            ) : null}
          </>
        )}
      </View>
    </>
  );

  const fitnessTarget = fitness.profile?.days_per_week ?? 0;
  const fitnessTab = !fitness.isPremium ? (
    <EmptyState
      icon="barbell-outline"
      title={t('Track your strength sessions')}
      body={t('Session and weight tracking are part of the Premium fitness coach.')}
      actionLabel={t('See what Premium adds')}
      onAction={() => router.push('/paywall?source=locked')}
    />
  ) : !fitness.profile ? (
    <EmptyState
      icon="barbell-outline"
      title={t('No fitness profile yet')}
      actionLabel={t('Get started')}
      onAction={() => router.push('/fitness/questionnaire')}
    />
  ) : (
    <>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatCard
          icon="barbell-outline"
          title={t('Sessions this week')}
          value={`${fitness.logsThisWeek.length} / ${fitnessTarget}`}
          caption={fitness.logsThisWeek.length >= fitnessTarget ? t('Target reached') : t('Keep going at your own pace')}
        >
          <ProgressBar progress={fitnessTarget ? fitness.logsThisWeek.length / fitnessTarget : 0} height={6} />
        </StatCard>
        <StatCard
          icon="scale-outline"
          title={t('Weight')}
          value={String(fitness.lastCheckin?.weight_kg ?? fitness.profile.weight_kg)}
          unit="kg"
          caption={fitness.lastCheckin?.weight_kg ? t('Last check-in') : t('Fitness profile')}
        />
      </View>
      <View style={{ marginTop: 16 }}>
        <ListRow icon="list-outline" title={t('See my progress in detail')} onPress={() => router.push('/fitness/program')} />
      </View>
    </>
  );

  const journal = journalQuery.data ?? [];
  const lastMoods = journal.filter((e) => typeof e.mood === 'number').slice(0, 10).reverse();
  const wellbeingAvg = averageMood(journal.map((e) => e.mood));
  const wellbeingTab = (
    <>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatCard icon="leaf-outline" title={t('Sessions finished')} value={String(journal.length)} caption={t('Of the last 30')} />
        <StatCard
          icon="happy-outline"
          iconColor={theme.yellow}
          title={t('Average rating')}
          value={wellbeingAvg === null ? '–' : `${moodOption(Math.round(wellbeingAvg))?.emoji ?? ''} ${wellbeingAvg}/5`}
        />
      </View>
      <Card style={{ marginTop: 16 }}>
        <Text variant="label">{t('How you felt after your sessions')}</Text>
        <Text variant="caption" tone="ink2" style={{ marginTop: 2, marginBottom: 14 }}>
          {lastMoods.length === 0
            ? t('Note how you feel at the end of a session.')
            : t('Your last {count} rated sessions', { count: lastMoods.length })}
        </Text>
        {lastMoods.length > 0 ? <MiniBars values={lastMoods.map((e) => e.mood)} max={5} height={56} color={theme.primary500} /> : null}
      </Card>
      <View style={{ marginTop: 16 }}>
        <ListRow icon="book-outline" title={t('Read my journal')} onPress={() => router.push('/wellbeing/journal')} />
      </View>
    </>
  );

  const nutritionTab = !fitness.isPremium ? (
    // The one place a free account meets nutrition: it names what they are missing, the shopping
    // list, rather than abstract “numbers”.
    <EmptyState
      icon="cart-outline"
      title={t('Your meals and your shopping list')}
      body={t('With Premium: days of meals matched to what you need, and the shopping list that goes with them, already sorted by aisle. No more “what are we eating tonight?”.')}
      actionLabel={t('See what Premium adds')}
      onAction={() => router.push('/paywall?source=locked')}
    />
  ) : !fitness.targets ? (
    <EmptyState
      icon="nutrition-outline"
      title={t('Your nutrition numbers')}
      body={t('Calories and macros worked out for you, with the fitness coach.')}
      actionLabel={t('Fill in my fitness profile')}
      onAction={() => router.push('/fitness/questionnaire')}
    />
  ) : (
    <>
      <Text variant="bodySm" tone="ink2" style={{ marginBottom: 12 }}>
        {t('Today’s numbers, worked out from your fitness profile.')}
      </Text>
      <TargetsCard targets={fitness.targets} />
      {fitness.plan ? (
        <View style={{ marginTop: 16 }}>
          <ListRow icon="restaurant-outline" title={t('My meals and my shopping list')} onPress={() => router.push('/fitness/nutrition')} />
        </View>
      ) : null}
    </>
  );

  return (
    <Screen inTabs refreshing={refreshing} onRefresh={refresh}>
      <ScreenHeader title={t('Tracking')} subtitle={t('Your progress, at a glance')} />
      <SegmentedControl
        label={t('Tracking')}
        value={tab}
        onChange={setTab}
        options={[
          { value: 'overview', label: t('Overview') },
          { value: 'fitness', label: t('Fitness') },
          { value: 'wellbeing', label: t('Wellbeing') },
          { value: 'nutrition', label: t('Nutrition') },
        ]}
      />
      <View style={{ height: 18 }} />
      {statsQuery.isError && tab === 'overview' ? (
        <ErrorState title={t('Your tracking could not be loaded')} onRetry={refresh} />
      ) : (
        <Appear key={tab}>
          {tab === 'overview' ? overview : tab === 'fitness' ? fitnessTab : tab === 'wellbeing' ? wellbeingTab : nutritionTab}
        </Appear>
      )}
    </Screen>
  );
}
