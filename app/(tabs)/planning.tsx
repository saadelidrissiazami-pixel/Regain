import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut, FadeOutRight, ZoomIn } from 'react-native-reanimated';
import { Text } from '../../src/components/typography';
import { CategoryBadge } from '../../src/components/CategoryBadge';
import { EnergyCheckin } from '../../src/components/EnergyCheckin';
import { Appear, Chevron, haptic, PressableScale, ProgressBar, Skeleton, Wiggle } from '../../src/components/motion';
import { ENERGY_SLOTS } from '../../src/features/onboarding/options';
import { buildWeekView, greetingFor } from '../../src/features/planning/weekView';
import { fetchAvailabilitySlots } from '../../src/lib/availability';
import { autoSyncWeekPlan, calendarUnavailableReason, syncWeekPlanToCalendar } from '../../src/lib/deviceCalendar';
import { formatDayLabel } from '../../src/lib/formatDate';
import { scheduleActivityReminders } from '../../src/lib/notifications';
import {
  fetchWeekPlan,
  generateAndSaveWeekPlan,
  markActivityDone,
  markActivityUndone,
  type PlannedActivityRow,
} from '../../src/lib/planning';
import { useToday, useWeekStart } from '../../src/lib/useCurrentDate';
import { useAuthStore } from '../../src/store/authStore';

function firstName(email?: string | null) {
  if (!email) return '';
  const local = email.split('@')[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function ActivityCard({
  item,
  index,
  onToggle,
  toggling,
}: {
  item: PlannedActivityRow;
  index: number;
  onToggle: () => void;
  toggling: boolean;
}) {
  // La coche se remplit dès le toucher : l'activité glisse ensuite hors de la liste.
  const checked = item.status === 'realise' || toggling;
  return (
    <Appear index={index} exiting={FadeOutRight.duration(280)}>
      <View
        className={`mb-2.5 flex-row items-center rounded-2xl border p-4 shadow-sm ${
          checked ? 'border-primary-soft bg-primary-soft' : 'border-line bg-surface'
        }`}
      >
        <Link href={`/activity/${item.activities_catalog.id}`} asChild>
          <Pressable className="flex-1 pr-3">
            <CategoryBadge
              category={item.activities_catalog.category}
              suffix={ENERGY_SLOTS.find((s) => s.key === item.time_slot)?.label}
            />
            <Text
              style={{ fontFamily: 'Nunito_700Bold' }}
              className={`mt-2 text-base ${checked ? 'text-ink-soft line-through' : 'text-ink'}`}
            >
              {item.activities_catalog.title}
            </Text>
            <Text className="mt-0.5 text-xs text-ink-soft">{item.activities_catalog.duration_minutes} min · Voir le détail →</Text>
          </Pressable>
        </Link>
        <PressableScale
          onPress={onToggle}
          disabled={toggling}
          scaleTo={0.85}
          feedback={null}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel={`Marquer « ${item.activities_catalog.title} » comme fait`}
          className={`h-9 w-9 items-center justify-center rounded-full ${checked ? 'bg-primary' : 'border-2 border-line'}`}
        >
          {checked ? (
            <Animated.View entering={ZoomIn.springify().damping(10)}>
              <Text className="text-sm text-white">✓</Text>
            </Animated.View>
          ) : null}
        </PressableScale>
      </View>
    </Appear>
  );
}

export default function PlanningScreen() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const weekStart = useWeekStart();
  const today = useToday();
  const [hour] = useState(() => new Date().getHours());
  const [showPast, setShowPast] = useState(false);

  const availabilityQuery = useQuery({
    queryKey: ['availability', userId],
    queryFn: () => fetchAvailabilitySlots(userId!),
    enabled: !!userId,
  });

  const planQuery = useQuery({
    queryKey: ['weekPlan', userId, weekStart],
    queryFn: () => fetchWeekPlan(userId!, weekStart),
    enabled: !!userId,
  });

  const generateMutation = useMutation({
    mutationFn: () => generateAndSaveWeekPlan(userId!, weekStart),
    onSuccess: (data) => {
      haptic.success();
      queryClient.setQueryData(['weekPlan', userId, weekStart], data);
      const availability = availabilityQuery.data ?? [];
      scheduleActivityReminders(data, availability).catch(() => {});
      autoSyncWeekPlan(data, availability, weekStart).catch(() => {});
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (item: PlannedActivityRow) =>
      item.status === 'realise' ? markActivityUndone(userId!, item.id) : markActivityDone(userId!, item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekPlan', userId, weekStart] });
      queryClient.invalidateQueries({ queryKey: ['trackingStats', userId] });
      queryClient.invalidateQueries({ queryKey: ['streak', userId] });
      queryClient.invalidateQueries({ queryKey: ['completedActivities', userId] });
    },
  });

  const toggle = (item: PlannedActivityRow) => {
    if (item.status !== 'realise') haptic.success();
    toggleMutation.mutate(item);
  };

  const calendarSyncMutation = useMutation({
    mutationFn: () => syncWeekPlanToCalendar(planQuery.data ?? [], availabilityQuery.data ?? [], weekStart),
    onSuccess: () => haptic.success(),
  });

  const hasAvailability = (availabilityQuery.data?.length ?? 0) > 0;
  const view = buildWeekView(planQuery.data ?? [], today);
  const hasPlan = view.totalCount > 0;
  const allDone = hasPlan && view.doneCount === view.totalCount;
  const hasPending = view.upcomingDays.length > 0 || view.pastPending.length > 0;

  const [refreshing, setRefreshing] = useState(false);
  const refetchAvailability = availabilityQuery.refetch;
  const refetchPlan = planQuery.refetch;
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchAvailability(), refetchPlan()]);
    setRefreshing(false);
  }, [refetchAvailability, refetchPlan]);

  let cardIndex = 0;
  const renderCard = (item: PlannedActivityRow) => (
    <ActivityCard
      key={item.id}
      item={item}
      index={cardIndex++}
      onToggle={() => toggle(item)}
      toggling={toggleMutation.isPending && toggleMutation.variables?.id === item.id}
    />
  );

  return (
    <ScrollView
      className="flex-1 bg-paper px-5 pt-16"
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B57" />}
    >
      <Appear>
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1 text-sm text-primary">
          {greetingFor(hour)} {firstName(session?.user.email)} 👋
        </Text>
        <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-6 text-[28px] leading-8 text-ink">
          Votre semaine
        </Text>
      </Appear>

      {hasPlan ? (
        <Appear index={1}>
          <View className="mb-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <View className="mb-2.5 flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-sm text-ink">
                {allDone ? 'Semaine bouclée !' : 'Votre progression'}
              </Text>
              <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-calm">
                {view.doneCount} / {view.totalCount} faites
              </Text>
            </View>
            <ProgressBar progress={view.doneCount / view.totalCount} color="#1E9C86" trackColor="#D9F1EB" />
          </View>
        </Appear>
      ) : null}

      <Appear index={2}>
        <Link href="/availability" asChild>
          <PressableScale
            scaleTo={0.98}
            className="mb-3 flex-row items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm"
          >
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
              📅 Gérer mes disponibilités
            </Text>
            <Text className="text-base text-primary">→</Text>
          </PressableScale>
        </Link>

        <EnergyCheckin userId={userId} />
      </Appear>

      {!availabilityQuery.isLoading && !hasAvailability ? (
        <Appear index={3}>
          <View className="mb-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <Text className="text-sm text-ink">
              Ajoutez d'abord quelques disponibilités pour que Regain puisse vous proposer un planning.
            </Text>
          </View>
        </Appear>
      ) : (
        <Appear index={3}>
          <PressableScale
            onPress={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            feedback="medium"
            className="mb-5 items-center rounded-full bg-primary px-4 py-3.5 shadow-sm"
          >
            {generateMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-white">
                {hasPlan ? '🔄 Régénérer mon planning' : '✨ Générer mon planning de la semaine'}
              </Text>
            )}
          </PressableScale>
        </Appear>
      )}

      {generateMutation.isError ? (
        <Text className="mb-4 text-xs text-red-700">{(generateMutation.error as Error).message}</Text>
      ) : null}

      {hasPending && calendarUnavailableReason ? (
        <Text className="mb-5 text-center text-xs text-ink-soft">📆 {calendarUnavailableReason}</Text>
      ) : hasPending ? (
        <PressableScale
          onPress={() => calendarSyncMutation.mutate()}
          disabled={calendarSyncMutation.isPending}
          scaleTo={0.98}
          className="mb-5 items-center rounded-full border border-line bg-surface px-4 py-3.5"
        >
          {calendarSyncMutation.isPending ? (
            <ActivityIndicator color="#FF6B57" />
          ) : (
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-ink">
              📆 Synchroniser avec mon calendrier
            </Text>
          )}
        </PressableScale>
      ) : null}
      {calendarSyncMutation.isError ? (
        <Text className="mb-4 text-xs text-red-700">{(calendarSyncMutation.error as Error).message}</Text>
      ) : null}
      {calendarSyncMutation.isSuccess ? (
        <Animated.View entering={FadeIn}>
          <Text className="mb-4 text-xs text-calm">
            {calendarSyncMutation.data} activité{calendarSyncMutation.data > 1 ? 's' : ''} ajoutée
            {calendarSyncMutation.data > 1 ? 's' : ''} au calendrier « Regain ».
          </Text>
        </Animated.View>
      ) : null}

      {planQuery.isLoading ? (
        <View>
          <Skeleton height={20} style={{ width: 120 }} />
          <Skeleton height={88} />
          <Skeleton height={88} />
          <Skeleton height={88} />
        </View>
      ) : null}

      {allDone ? (
        <Animated.View entering={ZoomIn.springify().damping(14)}>
          <View className="items-center rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <Wiggle>
              <Text className="mb-2 text-4xl">🎉</Text>
            </Wiggle>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-center text-base text-ink">
              Tout est fait pour cette semaine
            </Text>
            <Text className="mt-1 text-center text-xs text-ink-soft">
              Retrouvez ce que vous avez accompli dans l'Historique, sur l'onglet Suivi.
            </Text>
          </View>
        </Animated.View>
      ) : null}

      {view.upcomingDays.map(({ date, items }) => (
        <View key={date} className="mb-5">
          <Appear index={cardIndex}>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2 text-sm text-ink-soft">
              {date === today ? "Aujourd'hui" : formatDayLabel(date)}
            </Text>
          </Appear>
          {items.map(renderCard)}
        </View>
      ))}

      {hasPlan && !allDone && view.upcomingDays.length === 0 ? (
        <Text className="mb-5 text-sm text-ink-soft">Plus rien de prévu d'ici la fin de la semaine.</Text>
      ) : null}

      {view.pastPending.length > 0 ? (
        <Appear index={cardIndex}>
          <View className="mb-5 overflow-hidden rounded-2xl border border-line bg-surface">
            <Pressable
              onPress={() => {
                haptic.selection();
                setShowPast((v) => !v);
              }}
              className="flex-row items-center justify-between px-4 py-3.5"
            >
              <View className="flex-1 pr-3">
                <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-sm text-ink">
                  Jours passés
                </Text>
                <Text className="mt-0.5 text-xs text-ink-soft">
                  {view.pastPending.length} activité{view.pastPending.length > 1 ? 's' : ''} non cochée
                  {view.pastPending.length > 1 ? 's' : ''} — faites quand même ? Cochez-les.
                </Text>
              </View>
              <Chevron open={showPast}>
                <Text className="text-base text-ink-soft">›</Text>
              </Chevron>
            </Pressable>
            {showPast ? (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
                <View className="px-3 pb-1">
                  {view.pastPending.map((item) => (
                    <View key={item.id}>
                      <Text className="mb-1 ml-1 text-[11px] text-ink-soft">{formatDayLabel(item.date)}</Text>
                      {renderCard(item)}
                    </View>
                  ))}
                </View>
              </Animated.View>
            ) : null}
          </View>
        </Appear>
      ) : null}
    </ScrollView>
  );
}
