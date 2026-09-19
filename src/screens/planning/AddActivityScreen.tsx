import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ErrorState, errorMessage, InlineNotice, LoadingSkeleton } from '../../components/feedback';
import {
  Button,
  ChoiceChip,
  haptic,
  PressableScale,
  Screen,
  ScreenHeader,
  SegmentedControl,
  Select,
  Tag,
  Text,
  TextInput,
} from '../../components/ui';
import type { TimeSlot } from '../../features/availability/types';
import { CATEGORY_COLORS, CATEGORY_LABELS, type ActivityCategory } from '../../features/planning/types';
import { addPlannedActivity, fetchCatalog } from '../../lib/planning';
import { useUpcomingDates } from '../../lib/useCurrentDate';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeProvider';

const SLOTS: { value: TimeSlot; label: string }[] = [
  { value: 'matin', label: 'Matin' },
  { value: 'apres_midi', label: 'Après-midi' },
  { value: 'soir', label: 'Soir' },
];

/** Ajouter une activité du catalogue à un jour et un moment choisis. */
export default function AddActivityScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ date?: string }>();
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const dates = useUpcomingDates(14);
  const [date, setDate] = useState(() => (params.date && dates.some((d) => d.value === params.date) ? params.date : dates[0].value));
  const [slot, setSlot] = useState<TimeSlot>(() => (new Date().getHours() >= 17 ? 'soir' : new Date().getHours() >= 12 ? 'apres_midi' : 'matin'));
  const [category, setCategory] = useState<ActivityCategory | null>(null);
  const [search, setSearch] = useState('');
  const [activityId, setActivityId] = useState<string | null>(null);

  const catalogQuery = useQuery({ queryKey: ['catalog'], queryFn: fetchCatalog });
  const catalog = catalogQuery.data ?? [];
  const categories = Array.from(new Set(catalog.map((a) => a.category)));
  const needle = search.trim().toLowerCase();
  const filtered = catalog
    .filter((a) => (!category || a.category === category) && (!needle || a.title.toLowerCase().includes(needle)))
    .sort((a, b) => a.title.localeCompare(b.title, 'fr'));

  const addMutation = useMutation({
    mutationFn: () => addPlannedActivity(userId!, { activityId: activityId!, date, timeSlot: slot }),
    onSuccess: () => {
      haptic.success();
      queryClient.invalidateQueries({ queryKey: ['weekPlan', userId] });
      queryClient.invalidateQueries({ queryKey: ['planRange', userId] });
      queryClient.invalidateQueries({ queryKey: ['trackingStats', userId] });
      router.back();
    },
  });

  return (
    <Screen
      keyboard
      footer={
        <View>
          {addMutation.isError ? <InlineNotice tone="error" message={errorMessage(addMutation.error)} /> : null}
          <Button
            label="Ajouter au planning"
            icon="add"
            disabled={!activityId}
            loading={addMutation.isPending}
            onPress={() => addMutation.mutate()}
            style={{ marginTop: addMutation.isError ? 10 : 0 }}
          />
        </View>
      }
    >
      <ScreenHeader title="Ajouter une activité" subtitle="Choisis le moment, puis ce que tu as envie de faire." onBack={() => router.back()} backLabel="Fermer" />

      <Select label="Jour" value={date} options={dates} onChange={setDate} />
      <View style={{ marginBottom: 24 }}>
        <SegmentedControl label="Moment de la journée" tone="surface" value={slot} onChange={setSlot} options={SLOTS} />
      </View>

      <Text variant="section" style={{ marginBottom: 12 }} accessibilityRole="header">
        Activité
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 48,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.line,
          backgroundColor: theme.surface,
          paddingHorizontal: 14,
          marginBottom: 12,
        }}
      >
        <Ionicons name="search" size={18} color={theme.ink3} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher une activité"
          accessibilityLabel="Rechercher une activité"
          returnKeyType="search"
          style={{ flex: 1, marginLeft: 8, paddingVertical: 12 }}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginBottom: 12 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        <ChoiceChip label="Tout" selected={category === null} multiple={false} onPress={() => setCategory(null)} />
        {categories.map((c) => (
          <ChoiceChip key={c} label={CATEGORY_LABELS[c]} selected={category === c} multiple={false} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>

      {catalogQuery.isLoading ? (
        <LoadingSkeleton preset="list" />
      ) : catalogQuery.isError ? (
        <ErrorState onRetry={() => catalogQuery.refetch()} />
      ) : filtered.length === 0 ? (
        <Text variant="bodySm" tone="ink2">
          Aucune activité ne correspond. Essaie un autre mot ou une autre catégorie.
        </Text>
      ) : (
        <View accessibilityRole="radiogroup">
          {filtered.map((activity) => {
            const isSelected = activity.id === activityId;
            return (
              <PressableScale
                key={activity.id}
                onPress={() => setActivityId(activity.id)}
                feedback="selection"
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${activity.title}, ${CATEGORY_LABELS[activity.category]}, ${activity.duration_minutes} minutes`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  minHeight: 64,
                  marginBottom: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isSelected ? theme.primary600 : theme.line,
                  backgroundColor: isSelected ? theme.sage100 : theme.surface,
                }}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text variant="bodyStrong">{activity.title}</Text>
                  <View style={{ marginTop: 4 }}>
                    <Tag label={CATEGORY_LABELS[activity.category]} color={CATEGORY_COLORS[activity.category]} suffix={`${activity.duration_minutes} min`} />
                  </View>
                </View>
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={isSelected ? theme.primary600 : theme.ink3}
                />
              </PressableScale>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
