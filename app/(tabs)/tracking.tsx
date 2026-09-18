import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { FadeOutRight } from 'react-native-reanimated';
import { Text } from '../../src/components/typography';
import { CategoryBadge } from '../../src/components/CategoryBadge';
import { Appear, PressableScale, ProgressBar, Skeleton, Wiggle } from '../../src/components/motion';
import { ProgressRing } from '../../src/components/ProgressRing';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../src/features/planning/types';
import { averageMood, moodOption } from '../../src/features/wellbeing/reflection';
import { fetchWellbeingJournal, type JournalEntry } from '../../src/lib/wellbeing';
import { formatDayLabel } from '../../src/lib/formatDate';
import { fetchCompletedActivities, markActivityUndone } from '../../src/lib/planning';
import { fetchStreak, fetchWeekStats } from '../../src/lib/tracking';
import { useWeekStart } from '../../src/lib/useCurrentDate';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/theme/ThemeProvider';

const MOOD_BAR_COUNT = 10;
const MOOD_BAR_MAX_HEIGHT = 56;

/** Derniers ressentis de séance, du plus ancien au plus récent. */
function MoodTrend({ entries }: { entries: JournalEntry[] }) {
  const rated = entries.filter((entry) => typeof entry.mood === 'number');
  const recent = rated.slice(0, MOOD_BAR_COUNT).reverse();
  const average = averageMood(rated.map((entry) => entry.mood));
  const averageMoodOption = moodOption(average === null ? null : Math.round(average));

  return (
    <View className="mb-6 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-sm text-ink">
            Votre ressenti après les séances
          </Text>
          <Text className="mt-0.5 text-xs text-ink-soft">
            {average === null
              ? 'Notez votre ressenti à la fin d’une séance de bien-être.'
              : `${average} sur 5 en moyenne, sur ${rated.length} séance${rated.length > 1 ? 's' : ''}`}
          </Text>
        </View>
        {averageMoodOption ? <Text className="text-3xl">{averageMoodOption.emoji}</Text> : null}
      </View>

      {recent.length > 0 ? (
        <View className="flex-row items-end justify-between" style={{ height: MOOD_BAR_MAX_HEIGHT }}>
          {recent.map((entry) => (
            <View
              key={entry.id}
              accessibilityLabel={moodOption(entry.mood)?.label}
              style={{ height: ((entry.mood ?? 0) / 5) * MOOD_BAR_MAX_HEIGHT }}
              className="flex-1 mx-0.5 rounded-t-lg bg-calm"
            />
          ))}
        </View>
      ) : null}

      <Link href="/wellbeing/journal" asChild>
        <PressableScale scaleTo={0.98} className="mt-3 items-center rounded-full border border-line bg-paper py-2.5">
          <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-sm text-ink">
            📔 Relire mon journal
          </Text>
        </PressableScale>
      </Link>
    </View>
  );
}

export default function TrackingScreen() {
  const theme = useTheme();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const weekStart = useWeekStart();

  const statsQuery = useQuery({
    queryKey: ['trackingStats', userId, weekStart],
    queryFn: () => fetchWeekStats(userId!, weekStart),
    enabled: !!userId,
  });

  const streakQuery = useQuery({
    queryKey: ['streak', userId],
    queryFn: () => fetchStreak(userId!),
    enabled: !!userId,
  });

  const historyQuery = useQuery({
    queryKey: ['completedActivities', userId],
    queryFn: () => fetchCompletedActivities(userId!),
    enabled: !!userId,
  });

  const journalQuery = useQuery({
    queryKey: ['wellbeingJournal', userId],
    queryFn: () => fetchWellbeingJournal(userId!, 30),
    enabled: !!userId,
  });

  const undoMutation = useMutation({
    mutationFn: (plannedActivityId: string) => markActivityUndone(userId!, plannedActivityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completedActivities', userId] });
      queryClient.invalidateQueries({ queryKey: ['weekPlan', userId, weekStart] });
      queryClient.invalidateQueries({ queryKey: ['trackingStats', userId] });
      queryClient.invalidateQueries({ queryKey: ['streak', userId] });
    },
  });

  const stats = statsQuery.data;
  const streak = streakQuery.data ?? 0;
  const categoryEntries = Object.entries(stats?.minutesByCategory ?? {}) as [
    keyof typeof CATEGORY_LABELS,
    number,
  ][];
  const maxMinutes = Math.max(1, ...categoryEntries.map(([, minutes]) => minutes));

  const [refreshing, setRefreshing] = useState(false);
  const refetchStats = statsQuery.refetch;
  const refetchStreak = streakQuery.refetch;
  const refetchHistory = historyQuery.refetch;
  const refetchJournal = journalQuery.refetch;
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchStreak(), refetchHistory(), refetchJournal()]);
    setRefreshing(false);
  }, [refetchStats, refetchStreak, refetchHistory, refetchJournal]);

  return (
    <ScrollView
      className="flex-1 bg-paper px-5 pt-16"
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
    >
      <Appear>
        <Text style={{ fontFamily: 'Figtree_700Bold' }} className="mb-1 text-sm text-primary">
          {streak >= 2 ? `${streak} jours d'affilée, bravo !` : 'Continuez comme ça'}
        </Text>
        <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-6 text-[28px] leading-8 text-ink">
          Votre progression
        </Text>
      </Appear>

      <Appear index={1}>
        <View className="mb-6 flex-row items-center justify-around rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <View className="items-center">
            <ProgressRing progress={streak / 7} value={streak} label="jours de suite" color={theme.primary} trackColor={theme.primarySoft} />
            {streak > 0 ? (
              <View style={{ position: 'absolute', top: -6, right: -6 }}>
                <Wiggle>
                  <Text className="text-xl">🔥</Text>
                </Wiggle>
              </View>
            ) : null}
          </View>
          <ProgressRing
            progress={stats && stats.totalCount > 0 ? stats.completedCount / stats.totalCount : 0}
            value={stats?.completedCount ?? 0}
            total={stats?.totalCount ?? 0}
            label="activités faites"
            color={theme.calm}
            trackColor={theme.calmSoft}
          />
        </View>
      </Appear>

      <Appear index={2}>
        <MoodTrend entries={journalQuery.data ?? []} />
      </Appear>

      <Appear index={3}>
        <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-3 text-sm text-ink-soft">
          Temps par catégorie cette semaine
        </Text>
      </Appear>
      {statsQuery.isLoading ? (
        <View className="mb-6">
          <Skeleton height={28} />
          <Skeleton height={28} />
        </View>
      ) : categoryEntries.length === 0 ? (
        <Appear index={3}>
          <Text className="mb-6 text-sm text-ink-soft">
            Aucune activité réalisée pour l'instant — cochez-les depuis votre planning.
          </Text>
        </Appear>
      ) : (
        <View className="mb-6">
          {categoryEntries.map(([category, minutes], i) => (
            <Appear key={category} index={i + 3}>
              <View className="mb-3">
                <View className="mb-1.5 flex-row justify-between">
                  <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-sm text-ink">
                    {CATEGORY_LABELS[category]}
                  </Text>
                  <Text className="text-sm text-ink-soft">{minutes} min</Text>
                </View>
                <ProgressBar progress={minutes / maxMinutes} color={CATEGORY_COLORS[category]} delay={150 + i * 90} />
              </View>
            </Appear>
          ))}
        </View>
      )}

      <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-3 text-sm text-ink-soft">
        Historique
      </Text>
      {historyQuery.isLoading ? (
        <View>
          <Skeleton height={84} />
          <Skeleton height={84} />
        </View>
      ) : null}
      {historyQuery.data?.length === 0 ? (
        <Text className="text-sm text-ink-soft">Rien de coché pour l'instant.</Text>
      ) : null}
      {historyQuery.data?.map((item, i) => (
        <Appear key={item.id} index={i + 4} exiting={FadeOutRight.duration(260)}>
          <View className="mb-2.5 flex-row items-center rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <View className="flex-1 pr-3">
              <CategoryBadge category={item.activities_catalog.category} />
              <Text style={{ fontFamily: 'Figtree_700Bold' }} className="mt-2 text-base text-ink">
                {item.activities_catalog.title}
              </Text>
              <Text className="mt-0.5 text-xs text-ink-soft">{formatDayLabel(item.date)}</Text>
            </View>
            <PressableScale
              onPress={() => undoMutation.mutate(item.id)}
              disabled={undoMutation.isPending}
              feedback="selection"
              className="px-1 py-2"
            >
              {undoMutation.isPending && undoMutation.variables === item.id ? (
                <ActivityIndicator className="text-primary" size="small" />
              ) : (
                <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-sm text-accent">
                  Annuler
                </Text>
              )}
            </PressableScale>
          </View>
        </Appear>
      ))}
    </ScrollView>
  );
}
