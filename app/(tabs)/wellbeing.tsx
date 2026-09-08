import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { usePremium } from '../../src/lib/premium';
import { fetchCompletedProgramIds, fetchPrograms } from '../../src/lib/wellbeing';
import { useAuthStore } from '../../src/store/authStore';

const CATEGORY_ICONS: Record<string, string> = {
  Respiration: '🌬️',
  Méditation: '🧘',
  Journaling: '📝',
  'Confiance en soi': '🌟',
  Sommeil: '🌙',
  'En public': '🎧',
};

const FEATURED_SLUG = 'detachement-regard-autres';

export default function WellbeingScreen() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  const { isPremium } = usePremium();

  const programsQuery = useQuery({ queryKey: ['wellbeingPrograms'], queryFn: fetchPrograms });
  const completedQuery = useQuery({
    queryKey: ['completedPrograms', userId],
    queryFn: () => fetchCompletedProgramIds(userId!),
    enabled: !!userId,
  });

  const featured = programsQuery.data?.find((p) => p.slug === FEATURED_SLUG);
  const rest = programsQuery.data?.filter((p) => p.slug !== FEATURED_SLUG) ?? [];

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
      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1 text-sm text-calm">
        Prenez un moment
      </Text>
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-6 text-[28px] leading-8 text-ink">
        Bien-être
      </Text>

      {featured ? (
        <Link href={`/wellbeing/${featured.slug}`} asChild>
          <Pressable className="mb-5 overflow-hidden rounded-2xl shadow-sm">
            <LinearGradient colors={['#1E9C86', '#4E9BDE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18 }}>
              <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-[11px] uppercase tracking-wide text-white/90">
                🎧 Dans les transports ? En public ?
              </Text>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mt-1 text-lg text-white">
                Se détacher du regard des autres
              </Text>
              <Text className="mt-1 text-xs text-white/85">
                Les yeux ouverts, discrètement — où que vous soyez. →
              </Text>
            </LinearGradient>
          </Pressable>
        </Link>
      ) : null}

      {programsQuery.isLoading ? <ActivityIndicator color="#1E9C86" /> : null}

      {rest.map((program) => {
        const done = completedQuery.data?.has(program.id);
        const locked = program.premium_only && !isPremium;
        return (
          <Link key={program.id} href={locked ? '/paywall' : `/wellbeing/${program.slug}`} asChild>
            <Pressable className="mb-3 flex-row items-center rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <View className="mr-3.5 h-12 w-12 items-center justify-center rounded-2xl bg-calm-soft">
                <Text className="text-2xl">{CATEGORY_ICONS[program.category] ?? '✨'}</Text>
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-[11px] uppercase tracking-wide text-calm">
                  {program.category}
                </Text>
                <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mt-0.5 text-base text-ink">
                  {program.title}
                </Text>
                <Text className="mt-0.5 text-xs text-ink-soft">
                  {program.session_count} session{program.session_count > 1 ? 's' : ''}
                </Text>
              </View>
              {locked ? <Text className="text-lg">🔒</Text> : done ? <Text className="text-lg">✅</Text> : null}
            </Pressable>
          </Link>
        );
      })}

      <Text className="mt-2 text-xs text-ink-soft">
        Regain ne pose pas de diagnostic médical et ne remplace pas l'accompagnement d'un professionnel de santé.
      </Text>
    </ScrollView>
  );
}
