import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { CategoryBadge } from '../../src/components/CategoryBadge';
import { fetchActivityById } from '../../src/lib/planning';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const activityQuery = useQuery({
    queryKey: ['activity', id],
    queryFn: () => fetchActivityById(id!),
    enabled: !!id,
  });

  const activity = activityQuery.data;

  return (
    <ScrollView className="flex-1 bg-paper px-6 pt-16" contentContainerStyle={{ paddingBottom: 60 }}>
      <Pressable onPress={() => router.back()} className="mb-5">
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink-soft">
          ← Retour
        </Text>
      </Pressable>

      {activityQuery.isLoading ? <ActivityIndicator color="#FF6B57" /> : null}

      {activity ? (
        <>
          <CategoryBadge category={activity.category} />
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-1 mt-3 text-[26px] leading-8 text-ink">
            {activity.title}
          </Text>
          <Text className="mb-6 text-sm text-ink-soft">
            {activity.duration_minutes} min · {activity.cost_level === 'gratuit' ? 'Gratuit' : activity.cost_level === 'faible' ? 'Coût faible' : 'Coût modéré'}
          </Text>

          {activity.steps.length > 0 ? (
            <>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-3 text-sm text-ink-soft">
                Étapes
              </Text>
              {activity.steps.map((step, i) => (
                <View key={i} className="mb-3 flex-row items-start rounded-2xl border border-line bg-surface p-4 shadow-sm">
                  <View className="mr-3.5 h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
                    <Text className="text-3xl">{step.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-base text-ink">
                      {i + 1}. {step.title}
                    </Text>
                    <Text className="mt-1 text-sm leading-5 text-ink-soft">{step.description}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <Text className="text-sm text-ink-soft">
                Pas de fiche détaillée pour cette activité — laissez-vous guider par le titre, à votre rythme.
              </Text>
            </View>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}
