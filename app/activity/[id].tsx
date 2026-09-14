import { useQuery } from '@tanstack/react-query';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { CategoryBadge } from '../../src/components/CategoryBadge';
import { computeActivityFit, pickComplementaryActivities } from '../../src/features/planning/recommendation';
import { fetchActivityById, fetchCatalog, fetchPreferences } from '../../src/lib/planning';
import { useAuthStore } from '../../src/store/authStore';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;

  const activityQuery = useQuery({
    queryKey: ['activity', id],
    queryFn: () => fetchActivityById(id!),
    enabled: !!id,
  });

  const preferencesQuery = useQuery({
    queryKey: ['preferences', userId],
    queryFn: () => fetchPreferences(userId!),
    enabled: !!userId,
  });

  const catalogQuery = useQuery({ queryKey: ['catalog'], queryFn: fetchCatalog });

  const activity = activityQuery.data;
  const prefs = preferencesQuery.data;
  const fit = activity && prefs ? computeActivityFit(activity, prefs) : null;
  const complementary =
    activity && prefs && catalogQuery.data ? pickComplementaryActivities(activity, catalogQuery.data, prefs) : [];

  return (
    <ScrollView className="flex-1 bg-paper px-6 pt-16" contentContainerStyle={{ paddingBottom: 60 }}>
      <Pressable onPress={() => router.back()} className="mb-5">
        <Text className="font-label text-sm text-ink-soft">
          ← Retour
        </Text>
      </Pressable>

      {activityQuery.isLoading ? <ActivityIndicator color="#FF6B57" /> : null}

      {activity ? (
        <>
          <CategoryBadge category={activity.category} />
          <Text className="font-display mb-1 mt-3 text-[26px] leading-8 text-ink">
            {activity.title}
          </Text>
          <Text className="font-body mb-6 text-sm text-ink-soft">
            {activity.duration_minutes} min · {activity.cost_level === 'gratuit' ? 'Gratuit' : activity.cost_level === 'faible' ? 'Coût faible' : 'Coût modéré'}
          </Text>

          {fit ? (
            <View className="mb-6 rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <Text className="font-display mb-2.5 text-sm text-ink">
                Pour vous, précisément
              </Text>

              <Text className="font-body text-sm text-ink-soft">
                {fit.matchedGoalLabels.length > 0 ? (
                  <>
                    🎯 Sert vos objectifs :{' '}
                    <Text className="font-label text-ink">
                      {fit.matchedGoalLabels.join(', ')}
                    </Text>
                  </>
                ) : (
                  "🎯 Ne recoupe aucun de vos objectifs actuels — à tester si l'envie est là."
                )}
              </Text>

              <Text className="font-body mt-2 text-sm text-ink-soft">
                {fit.goodEnergySlotLabels.length === 3 ? (
                  '⚡️ Adaptée à votre énergie, à tout moment de la journée.'
                ) : fit.goodEnergySlotLabels.length > 0 ? (
                  <>
                    ⚡️ Plutôt bien adaptée le{' '}
                    <Text className="font-label text-ink">
                      {fit.goodEnergySlotLabels.join(', ').toLowerCase()}
                    </Text>
                    , selon votre énergie habituelle.
                  </>
                ) : (
                  '⚡️ Demande plus d’énergie que votre niveau habituel — mieux un jour en forme.'
                )}
              </Text>

              <Text className="font-body mt-2 text-sm text-ink-soft">
                {fit.budgetFits ? '💶 Correspond à votre budget.' : '💶 Un peu au-dessus de votre budget habituel.'}
              </Text>
            </View>
          ) : null}

          {activity.steps.length > 0 ? (
            <>
              <Text className="font-display mb-3 text-sm text-ink-soft">
                Étapes
              </Text>
              {activity.steps.map((step, i) => (
                <View key={i} className="mb-3 flex-row items-start rounded-2xl border border-line bg-surface p-4 shadow-sm">
                  <View className="mr-3.5 h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
                    <Text className="font-body text-3xl">{step.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-label text-base text-ink">
                      {i + 1}. {step.title}
                    </Text>
                    <Text className="font-body mt-1 text-sm leading-5 text-ink-soft">{step.description}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <Text className="font-body text-sm text-ink-soft">
                Pas de fiche détaillée pour cette activité — laissez-vous guider par le titre, à votre rythme.
              </Text>
            </View>
          )}

          {complementary.length > 0 ? (
            <>
              <Text className="font-display mb-3 mt-6 text-sm text-ink-soft">
                Dans la même veine
              </Text>
              {complementary.map((a) => (
                <Link key={a.id} href={`/activity/${a.id}`} asChild>
                  <Pressable className="mb-2.5 flex-row items-center rounded-2xl border border-line bg-surface p-4 shadow-sm">
                    <View className="flex-1 pr-3">
                      <CategoryBadge category={a.category} />
                      <Text className="font-label mt-2 text-base text-ink">
                        {a.title}
                      </Text>
                      <Text className="font-body mt-0.5 text-xs text-ink-soft">{a.duration_minutes} min</Text>
                    </View>
                    <Text className="font-body text-base text-primary">→</Text>
                  </Pressable>
                </Link>
              ))}
            </>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}
