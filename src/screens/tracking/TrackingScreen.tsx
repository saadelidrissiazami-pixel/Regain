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
import { fromLocalISODate } from '../../lib/week';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeProvider';

type Tab = 'overview' | 'fitness' | 'wellbeing' | 'nutrition';
const DAY_LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

/** Suivi : « Est-ce que je progresse ? » */
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
          title="Activities this week"
          value={stats ? `${stats.completedCount} / ${stats.totalCount}` : '–'}
          caption={stats && stats.totalCount > 0 ? `${Math.round((stats.completedCount / stats.totalCount) * 100)}%` : 'No plan yet'}
          onPress={() => router.push('/planning/week')}
        >
          <ProgressBar progress={stats && stats.totalCount > 0 ? stats.completedCount / stats.totalCount : 0} height={6} />
        </StatCard>
        <StatCard
          icon="flash-outline"
          iconColor={theme.orange}
          title="Average energy"
          value={energyAvg === null ? '–' : `${energyLabel(energyAvg).emoji} ${energyLabel(energyAvg).label}`}
          delta={energyDelta}
          caption={energyAvg === null ? 'Answer today’s check-in' : undefined}
        >
          <MiniBars values={energyBars} max={5} labels={dayLetters} color={theme.orange} />
        </StatCard>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <StatCard
          icon="moon-outline"
          iconColor={theme.purple}
          title="Sommeil"
          value={sleepQuery.data ? formatSleep(sleepQuery.data) : '–'}
          caption={sleepQuery.data ? 'Your usual amount' : 'Tell us your usual amount'}
          onPress={() => router.push('/profile/goals')}
        />
        <StatCard
          icon="happy-outline"
          iconColor={theme.yellow}
          title="Mood after your sessions"
          value={moodAvg === null ? '–' : moodLabel(moodAvg)}
          delta={moodDelta}
          caption={moodAvg === null ? 'Note how you feel at the end of a session' : undefined}
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
              {streak > 0 ? `${streak} day${streak > 1 ? 's' : ''} in a row` : 'Your streak starts today'}
            </Text>
            <Text variant="caption" tone="ink2">
              {streak >= 2 ? 'Keep going at your own pace.' : 'One activity ticked a day is enough to grow it.'}
            </Text>
          </View>
        </View>
      </Card>

      <View style={{ marginTop: 28 }}>
        <SectionHeader title="Time by category" subtitle="What you got through this week" />
        {statsQuery.isLoading ? (
          <LoadingSkeleton preset="list" />
        ) : categoryEntries.length === 0 ? (
          <Text variant="bodySm" tone="ink2">
            Nothing ticked off this week yet — tick your activities from the plan.
          </Text>
        ) : (
          <Card>
            {categoryEntries.map(([category, minutes], i) => (
              <View key={category} style={{ marginBottom: i === categoryEntries.length - 1 ? 0 : 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text variant="label">{CATEGORY_LABELS[category]}</Text>
                  <Text variant="caption" tone="ink2" tabular>
                    {minutes} min
                  </Text>
                </View>
                <ProgressBar progress={minutes / maxMinutes} color={CATEGORY_COLORS[category]} delay={120 + i * 80} height={6} />
              </View>
            ))}
          </Card>
        )}
      </View>

      <View style={{ marginTop: 28 }}>
        <SectionHeader title="Historique" />
        {historyQuery.isLoading ? (
          <LoadingSkeleton preset="list" />
        ) : history.length === 0 ? (
          <Text variant="bodySm" tone="ink2">
            Nothing ticked off yet.
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
                    accessibilityLabel={`Undo “${item.activities_catalog.title}”`}
                    style={{ minHeight: 44, minWidth: 64, alignItems: 'center', justifyContent: 'center' }}
                  >
                    {undoMutation.isPending && undoMutation.variables === item.id ? (
                      <ActivityIndicator size="small" color={theme.primary600} />
                    ) : (
                      <Text variant="label" tone="ink2">
                        Undo
                      </Text>
                    )}
                  </PressableScale>
                </View>
              </Card>
            ))}
            {history.length > 5 ? (
              <TextLink
                label={showAllHistory ? 'Show less' : `See all ${history.length} activities`}
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
      title="Track your strength sessions"
      body="Session and weight tracking are part of the Premium fitness coach."
      actionLabel="See what Premium adds"
      onAction={() => router.push('/paywall?source=locked')}
    />
  ) : !fitness.profile ? (
    <EmptyState icon="barbell-outline" title="No fitness profile yet" actionLabel="Get started" onAction={() => router.push('/fitness/questionnaire')} />
  ) : (
    <>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatCard
          icon="barbell-outline"
          title="Sessions this week"
          value={`${fitness.logsThisWeek.length} / ${fitnessTarget}`}
          caption={fitness.logsThisWeek.length >= fitnessTarget ? 'Target reached' : 'Keep going at your own pace'}
        >
          <ProgressBar progress={fitnessTarget ? fitness.logsThisWeek.length / fitnessTarget : 0} height={6} />
        </StatCard>
        <StatCard
          icon="scale-outline"
          title="Poids"
          value={fitness.lastCheckin?.weight_kg ? String(fitness.lastCheckin.weight_kg).replace('.', ',') : String(fitness.profile.weight_kg).replace('.', ',')}
          unit="kg"
          caption={fitness.lastCheckin?.weight_kg ? 'Dernier bilan' : 'Profil forme'}
        />
      </View>
      <View style={{ marginTop: 16 }}>
        <ListRow icon="list-outline" title="See my progress in detail" onPress={() => router.push('/fitness/program')} />
      </View>
    </>
  );

  const journal = journalQuery.data ?? [];
  const lastMoods = journal.filter((e) => typeof e.mood === 'number').slice(0, 10).reverse();
  const wellbeingAvg = averageMood(journal.map((e) => e.mood));
  const wellbeingTab = (
    <>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatCard icon="leaf-outline" title="Sessions finished" value={String(journal.length)} caption="Of the last 30" />
        <StatCard
          icon="happy-outline"
          iconColor={theme.yellow}
          title="Ressenti moyen"
          value={wellbeingAvg === null ? '–' : `${moodOption(Math.round(wellbeingAvg))?.emoji ?? ''} ${String(wellbeingAvg).replace('.', ',')}/5`}
        />
      </View>
      <Card style={{ marginTop: 16 }}>
        <Text variant="label">How you felt after your sessions</Text>
        <Text variant="caption" tone="ink2" style={{ marginTop: 2, marginBottom: 14 }}>
          {lastMoods.length === 0 ? 'Note how you feel at the end of a session.' : `Your last ${lastMoods.length} rated sessions`}
        </Text>
        {lastMoods.length > 0 ? <MiniBars values={lastMoods.map((e) => e.mood)} max={5} height={56} color={theme.primary500} /> : null}
      </Card>
      <View style={{ marginTop: 16 }}>
        <ListRow icon="book-outline" title="Relire mon journal" onPress={() => router.push('/wellbeing/journal')} />
      </View>
    </>
  );

  const nutritionTab = !fitness.isPremium ? (
    // The one place a free account meets nutrition: it names what they are missing, the shopping
    // list, rather than abstract “numbers”.
    <EmptyState
      icon="cart-outline"
      title="Your meals and your shopping list"
      body="With Premium: days of meals matched to what you need, and the shopping list that goes with them, already sorted by aisle. No more “what are we eating tonight?”."
      actionLabel="See what Premium adds"
      onAction={() => router.push('/paywall?source=locked')}
    />
  ) : !fitness.targets ? (
    <EmptyState
      icon="nutrition-outline"
      title="Your nutrition numbers"
      body="Calories and macros worked out for you, with the fitness coach."
      actionLabel="Remplir mon profil forme"
      onAction={() => router.push('/fitness/questionnaire')}
    />
  ) : (
    <>
      <Text variant="bodySm" tone="ink2" style={{ marginBottom: 12 }}>
        Today’s numbers, worked out from your fitness profile.
      </Text>
      <TargetsCard targets={fitness.targets} />
      {fitness.plan ? (
        <View style={{ marginTop: 16 }}>
          <ListRow icon="restaurant-outline" title="My meals and my shopping list" onPress={() => router.push('/fitness/nutrition')} />
        </View>
      ) : null}
    </>
  );

  return (
    <Screen inTabs refreshing={refreshing} onRefresh={refresh}>
      <ScreenHeader title="Tracking" subtitle="Your progress, at a glance" />
      <SegmentedControl
        label="Suivi"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'overview', label: 'Overview' },
          { value: 'fitness', label: 'Forme' },
          { value: 'wellbeing', label: 'Wellbeing' },
          { value: 'nutrition', label: 'Nutrition' },
        ]}
      />
      <View style={{ height: 18 }} />
      {statsQuery.isError && tab === 'overview' ? (
        <ErrorState title="Ton suivi n'a pas pu se charger" onRetry={refresh} />
      ) : (
        <Appear key={tab}>
          {tab === 'overview' ? overview : tab === 'fitness' ? fitnessTab : tab === 'wellbeing' ? wellbeingTab : nutritionTab}
        </Appear>
      )}
    </Screen>
  );
}
