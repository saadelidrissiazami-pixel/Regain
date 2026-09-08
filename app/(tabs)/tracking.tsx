import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

import { ProgressRing } from '../../src/components/ProgressRing';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../src/features/planning/types';
import { fetchStreak, fetchWeekStats } from '../../src/lib/tracking';
import { getWeekStart } from '../../src/lib/week';
import { useAuthStore } from '../../src/store/authStore';

const weekStart = getWeekStart();

export default function TrackingScreen() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;

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

  const stats = statsQuery.data;
  const categoryEntries = Object.entries(stats?.minutesByCategory ?? {}) as [
    keyof typeof CATEGORY_LABELS,
    number,
  ][];
  const maxMinutes = Math.max(1, ...categoryEntries.map(([, minutes]) => minutes));

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([statsQuery.refetch(), streakQuery.refetch()]);
    setRefreshing(false);
  }, [statsQuery.refetch, streakQuery.refetch]);

  return (
    <ScrollView
      className="flex-1 bg-paper px-5 pt-16"
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B57" />}
    >
      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1 text-sm text-primary">
        Continuez comme ça
      </Text>
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-6 text-[28px] leading-8 text-ink">
        Votre progression
      </Text>

      <View className="mb-6 flex-row items-center justify-around rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <ProgressRing
          progress={(streakQuery.data ?? 0) / 7}
          value={`${streakQuery.data ?? 0}`}
          label="jours de suite"
          color="#FF6B57"
          trackColor="#FFE4DD"
        />
        <ProgressRing
          progress={stats ? (stats.totalCount > 0 ? stats.completedCount / stats.totalCount : 0) : 0}
          value={stats ? `${stats.completedCount}/${stats.totalCount}` : '0/0'}
          label="activités faites"
          color="#1E9C86"
          trackColor="#D9F1EB"
        />
      </View>

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-3 text-sm text-ink-soft">
        Temps par catégorie cette semaine
      </Text>
      {categoryEntries.length === 0 ? (
        <Text className="text-sm text-ink-soft">
          Aucune activité réalisée pour l'instant — cochez-les depuis votre planning.
        </Text>
      ) : (
        categoryEntries.map(([category, minutes]) => (
          <View key={category} className="mb-3">
            <View className="mb-1.5 flex-row justify-between">
              <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
                {CATEGORY_LABELS[category]}
              </Text>
              <Text className="text-sm text-ink-soft">{minutes} min</Text>
            </View>
            <View className="h-2.5 overflow-hidden rounded-full bg-line">
              <View
                className="h-2.5 rounded-full"
                style={{ width: `${(minutes / maxMinutes) * 100}%`, backgroundColor: CATEGORY_COLORS[category] }}
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
