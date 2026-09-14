import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { usePremium } from '../../src/lib/premium';
import { fetchCompletedProgramIds, fetchPrograms } from '../../src/lib/wellbeing';
import { useAuthStore } from '../../src/store/authStore';
import type { WellbeingProgram } from '../../src/features/wellbeing/types';

const CATEGORY_ICONS: Record<string, string> = {
  Respiration: '🌬️',
  Méditation: '🧘',
  Journaling: '📝',
  'Confiance en soi': '🌟',
  Sommeil: '🌙',
  'En public': '🎧',
};

const CATEGORY_ORDER = Object.keys(CATEGORY_ICONS);
const FEATURED_SLUG = 'detachement-regard-autres';

export default function WellbeingScreen() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  // Tant que l'entitlement n'est pas résolu, usePremium renvoie false : verrouiller
  // sur cette valeur enverrait un abonné au paywall le temps du chargement.
  const { isPremium, isLoading: premiumLoading } = usePremium();

  const programsQuery = useQuery({ queryKey: ['wellbeingPrograms'], queryFn: fetchPrograms });
  const completedQuery = useQuery({
    queryKey: ['completedPrograms', userId],
    queryFn: () => fetchCompletedProgramIds(userId!),
    enabled: !!userId,
  });

  const featured = programsQuery.data?.find((p) => p.slug === FEATURED_SLUG);

  const byCategory = new Map<string, WellbeingProgram[]>();
  for (const program of programsQuery.data ?? []) {
    if (program.slug === FEATURED_SLUG) continue;
    const list = byCategory.get(program.category) ?? [];
    list.push(program);
    byCategory.set(program.category, list);
  }
  for (const list of byCategory.values()) {
    list.sort((a, b) => a.duration_minutes - b.duration_minutes);
  }
  const categories = [...byCategory.keys()].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
  );

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([programsQuery.refetch(), completedQuery.refetch()]);
    setRefreshing(false);
  }, [programsQuery.refetch, completedQuery.refetch]);

  return (
    <ScrollView
      className="flex-1 bg-paper px-5 pt-16"
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E9C86" />}
    >
      <Text className="font-label mb-1 text-sm text-calm">
        Prenez un moment
      </Text>
      <Text className="font-display mb-6 text-[28px] leading-8 text-ink">
        Bien-être
      </Text>

      {featured ? (
        <Link href={`/wellbeing/${featured.slug}`} asChild>
          <Pressable className="mb-6 overflow-hidden rounded-2xl shadow-sm">
            <LinearGradient colors={['#1E9C86', '#4E9BDE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18 }}>
              <Text className="font-label text-[11px] uppercase tracking-wide text-white/90">
                🎧 Dans les transports ? En public ?
              </Text>
              <Text className="font-display mt-1 text-lg text-white">
                Se détacher du regard des autres
              </Text>
              <Text className="font-body mt-1 text-xs text-white/85">
                Les yeux ouverts, discrètement — où que vous soyez. →
              </Text>
            </LinearGradient>
          </Pressable>
        </Link>
      ) : null}

      {programsQuery.isLoading ? <ActivityIndicator color="#1E9C86" /> : null}

      {categories.map((category) => (
        <View key={category} className="mb-6">
          <View className="mb-2.5 flex-row items-center">
            <Text className="font-body mr-2 text-lg">{CATEGORY_ICONS[category] ?? '✨'}</Text>
            <Text className="font-display text-sm text-ink-soft">
              {category}
            </Text>
          </View>

          {byCategory.get(category)!.map((program) => {
            const done = completedQuery.data?.has(program.id);
            const checking = program.premium_only && premiumLoading;
            const locked = program.premium_only && !premiumLoading && !isPremium;

            const row = (
              <Pressable
                disabled={checking}
                className="mb-2.5 flex-row items-center rounded-2xl border border-line bg-surface p-4 shadow-sm"
              >
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-calm-soft">
                  <Text className="font-display text-xs text-calm">{program.duration_minutes}′</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-label text-base text-ink">{program.title}</Text>
                  <Text className="font-body mt-0.5 text-xs text-ink-soft">{program.duration_minutes} min</Text>
                </View>
                {checking ? (
                  <ActivityIndicator size="small" color="#1E9C86" />
                ) : locked ? (
                  <Text className="font-body text-lg">🔒</Text>
                ) : done ? (
                  <Text className="font-body text-lg">✅</Text>
                ) : null}
              </Pressable>
            );

            if (checking) return <View key={program.id}>{row}</View>;

            return (
              <Link key={program.id} href={locked ? '/paywall' : `/wellbeing/${program.slug}`} asChild>
                {row}
              </Link>
            );
          })}
        </View>
      ))}

      <Text className="font-body mt-2 text-xs text-ink-soft">
        Regain ne pose pas de diagnostic médical et ne remplace pas l'accompagnement d'un professionnel de santé.
      </Text>
    </ScrollView>
  );
}
