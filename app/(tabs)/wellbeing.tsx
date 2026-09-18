import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Appear, Chevron, haptic, PressableScale, Skeleton } from '../../src/components/motion';
import { Text } from '../../src/components/typography';
import { usePremium } from '../../src/lib/premium';
import { moodOption } from '../../src/features/wellbeing/reflection';
import { fetchCompletedProgramIds, fetchPrograms, fetchWellbeingJournal } from '../../src/lib/wellbeing';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/theme/ThemeProvider';
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
  const theme = useTheme();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  // Tant que l'entitlement RevenueCat n'est pas résolu, on n'affiche pas de cadenas :
  // sinon un abonné voit ses séances verrouillées pendant la résolution.
  const { isPremium, isLoading: premiumLoading } = usePremium();

  const programsQuery = useQuery({ queryKey: ['wellbeingPrograms'], queryFn: fetchPrograms });
  const completedQuery = useQuery({
    queryKey: ['completedPrograms', userId],
    queryFn: () => fetchCompletedProgramIds(userId!),
    enabled: !!userId,
  });
  const journalQuery = useQuery({
    queryKey: ['wellbeingJournal', userId],
    queryFn: () => fetchWellbeingJournal(userId!, 20),
    enabled: !!userId,
  });
  const lastEntry = journalQuery.data?.[0];
  const lastMood = moodOption(lastEntry?.mood);

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

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const toggleCategory = (category: string) => {
    haptic.selection();
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const [refreshing, setRefreshing] = useState(false);
  const refetchPrograms = programsQuery.refetch;
  const refetchCompleted = completedQuery.refetch;
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchPrograms(), refetchCompleted()]);
    setRefreshing(false);
  }, [refetchPrograms, refetchCompleted]);

  return (
    <ScrollView
      className="flex-1 bg-paper px-5 pt-16"
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.calm} />}
    >
      <Appear>
        <Text style={{ fontFamily: 'Figtree_700Bold' }} className="mb-1 text-sm text-calm">
          Prenez un moment
        </Text>
        <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-6 text-[28px] leading-8 text-ink">
          Bien-être
        </Text>
      </Appear>

      {featured ? (
        <Appear index={1}>
          <Link href={`/wellbeing/${featured.slug}`} asChild>
            <PressableScale scaleTo={0.97} className="mb-6 overflow-hidden rounded-2xl shadow-sm">
              <LinearGradient colors={[theme.sky, theme.skySoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18 }}>
                <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-[11px] uppercase tracking-wide text-ink-soft">
                  🎧 Dans les transports ? En public ?
                </Text>
                <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mt-1 text-lg text-ink">
                  Se détacher du regard des autres
                </Text>
                <Text className="mt-1 text-xs text-ink-soft">
                  Les yeux ouverts, discrètement — où que vous soyez. →
                </Text>
              </LinearGradient>
            </PressableScale>
          </Link>
        </Appear>
      ) : null}

      <Appear index={2}>
        <Link href="/wellbeing/journal" asChild>
          <PressableScale
            scaleTo={0.98}
            className="mb-5 flex-row items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm"
          >
            <View className="flex-1 pr-3">
              <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-sm text-ink">
                📔 Mon journal
              </Text>
              <Text className="mt-0.5 text-xs text-ink-soft">
                {lastEntry
                  ? `Dernière séance : ${lastEntry.program?.title ?? 'séance'}${lastMood ? ` · ${lastMood.label}` : ''}`
                  : 'Vos ressentis et vos réponses, séance après séance.'}
              </Text>
            </View>
            {lastMood ? <Text className="mr-2 text-xl">{lastMood.emoji}</Text> : null}
            <Text className="text-base text-primary">→</Text>
          </PressableScale>
        </Link>
      </Appear>

      {programsQuery.isLoading ? (
        <View>
          <Skeleton height={96} style={{ marginBottom: 24 }} />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={64} />
          ))}
        </View>
      ) : null}

      {categories.map((category, categoryIndex) => {
        const programs = byCategory.get(category)!;
        const isExpanded = expandedCategories.has(category);
        const doneCount = programs.filter((p) => completedQuery.data?.has(p.id)).length;

        return (
          <Appear key={category} index={categoryIndex + 3}>
            <View className="mb-3 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
              <Pressable
                onPress={() => toggleCategory(category)}
                className="flex-row items-center justify-between px-4 py-3.5"
              >
                <View className="flex-row items-center">
                  <Text className="mr-2 text-lg">{CATEGORY_ICONS[category] ?? '✨'}</Text>
                  <View>
                    <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-sm text-ink">
                      {category}
                    </Text>
                    <Text className="mt-0.5 text-xs text-ink-soft">
                      {programs.length} séance{programs.length > 1 ? 's' : ''}
                      {doneCount > 0 ? ` · ${doneCount} terminée${doneCount > 1 ? 's' : ''}` : ''}
                    </Text>
                  </View>
                </View>
                <Chevron open={isExpanded}>
                  <Text className="text-base text-ink-soft">›</Text>
                </Chevron>
              </Pressable>

              {isExpanded ? (
                <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(140)}>
                  <View className="px-3 pb-3">
                    {programs.map((program, programIndex) => {
                      const done = completedQuery.data?.has(program.id);
                      const locked = program.premium_only && !isPremium && !premiumLoading;
                      return (
                        <Appear key={program.id} index={programIndex}>
                          <Link href={locked ? '/paywall' : `/wellbeing/${program.slug}`} asChild>
                            <PressableScale scaleTo={0.97} className="mb-2 flex-row items-center rounded-2xl border border-line bg-paper p-4">
                              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-calm-soft">
                                <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-xs text-calm">
                                  {program.duration_minutes}′
                                </Text>
                              </View>
                              <View className="flex-1">
                                <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-base text-ink">
                                  {program.title}
                                </Text>
                                <Text className="mt-0.5 text-xs text-ink-soft">{program.duration_minutes} min</Text>
                              </View>
                              {locked ? <Text className="text-lg">🔒</Text> : done ? <Text className="text-lg">✅</Text> : null}
                            </PressableScale>
                          </Link>
                        </Appear>
                      );
                    })}
                  </View>
                </Animated.View>
              ) : null}
            </View>
          </Appear>
        );
      })}

      <Text className="mt-2 text-xs text-ink-soft">
        Regain ne pose pas de diagnostic médical et ne remplace pas l'accompagnement d'un professionnel de santé.
      </Text>
    </ScrollView>
  );
}
