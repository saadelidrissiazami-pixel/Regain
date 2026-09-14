import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { Text } from '../../src/components/typography';
import { CategoryBadge } from '../../src/components/CategoryBadge';
import { EnergyCheckin } from '../../src/components/EnergyCheckin';
import { ENERGY_SLOTS } from '../../src/features/onboarding/options';
import { fetchAvailabilitySlots } from '../../src/lib/availability';
import { syncWeekPlanToCalendar } from '../../src/lib/deviceCalendar';
import { formatDayLabel } from '../../src/lib/formatDate';
import { scheduleActivityReminders } from '../../src/lib/notifications';
import {
  fetchWeekPlan,
  generateAndSaveWeekPlan,
  markActivityDone,
  markActivityUndone,
  type PlannedActivityRow,
} from '../../src/lib/planning';
import { useWeekStart } from '../../src/lib/useCurrentDate';
import { useAuthStore } from '../../src/store/authStore';


function firstName(email?: string | null) {
  if (!email) return '';
  const local = email.split('@')[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function ActivityCard({
  item,
  onToggle,
  toggling,
}: {
  item: PlannedActivityRow;
  onToggle: () => void;
  toggling: boolean;
}) {
  const done = item.status === 'realise';
  return (
    <View
      className={`mb-2.5 flex-row items-center rounded-2xl border p-4 shadow-sm ${
        done ? 'border-primary-soft bg-primary-soft' : 'border-line bg-surface'
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
            className={`mt-2 text-base ${done ? 'text-ink-soft line-through' : 'text-ink'}`}
          >
            {item.activities_catalog.title}
          </Text>
          <Text className="mt-0.5 text-xs text-ink-soft">{item.activities_catalog.duration_minutes} min · Voir le détail →</Text>
        </Pressable>
      </Link>
      <Pressable
        onPress={onToggle}
        disabled={toggling}
        className={`h-9 w-9 items-center justify-center rounded-full ${done ? 'bg-primary' : 'border-2 border-line'}`}
      >
        {toggling ? (
          <ActivityIndicator size="small" color={done ? '#FFFFFF' : '#FF6B57'} />
        ) : done ? (
          <Text className="text-sm text-white">✓</Text>
        ) : null}
      </Pressable>
    </View>
  );
}

export default function PlanningScreen() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const weekStart = useWeekStart();

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
      queryClient.setQueryData(['weekPlan', userId, weekStart], data);
      scheduleActivityReminders(data).catch(() => {});
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

  const calendarSyncMutation = useMutation({
    mutationFn: () => syncWeekPlanToCalendar(planQuery.data ?? [], weekStart),
  });

  const hasAvailability = (availabilityQuery.data?.length ?? 0) > 0;
  const activeItems = (planQuery.data ?? []).filter((item) => item.status !== 'realise');
  const days = Array.from(new Set(activeItems.map((item) => item.date)));
  const allDone = (planQuery.data?.length ?? 0) > 0 && activeItems.length === 0;

  const [refreshing, setRefreshing] = useState(false);
  const refetchAvailability = availabilityQuery.refetch;
  const refetchPlan = planQuery.refetch;
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchAvailability(), refetchPlan()]);
    setRefreshing(false);
  }, [refetchAvailability, refetchPlan]);

  return (
    <ScrollView
      className="flex-1 bg-paper px-5 pt-16"
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B57" />}
    >
      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1 text-sm text-primary">
        Bonjour {firstName(session?.user.email)} 👋
      </Text>
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-6 text-[28px] leading-8 text-ink">
        Votre semaine
      </Text>

      <Link href="/availability" asChild>
        <Pressable className="mb-3 flex-row items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
            📅 Gérer mes disponibilités
          </Text>
          <Text className="text-base text-primary">→</Text>
        </Pressable>
      </Link>

      <EnergyCheckin userId={userId} />

      {!availabilityQuery.isLoading && !hasAvailability ? (
        <View className="mb-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <Text className="text-sm text-ink">
            Ajoutez d'abord quelques disponibilités pour que Regain puisse vous proposer un planning.
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="mb-5 items-center rounded-full bg-primary px-4 py-3.5 shadow-sm"
        >
          {generateMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-white">
              {(planQuery.data?.length ?? 0) > 0 ? '🔄 Régénérer mon planning' : '✨ Générer mon planning de la semaine'}
            </Text>
          )}
        </Pressable>
      )}

      {generateMutation.isError ? (
        <Text className="mb-4 text-xs text-red-700">{(generateMutation.error as Error).message}</Text>
      ) : null}

      {days.length > 0 ? (
        <Pressable
          onPress={() => calendarSyncMutation.mutate()}
          disabled={calendarSyncMutation.isPending}
          className="mb-5 items-center rounded-full border border-line bg-surface px-4 py-3.5"
        >
          {calendarSyncMutation.isPending ? (
            <ActivityIndicator color="#FF6B57" />
          ) : (
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-ink">
              📆 Synchroniser avec mon calendrier
            </Text>
          )}
        </Pressable>
      ) : null}
      {calendarSyncMutation.isError ? (
        <Text className="mb-4 text-xs text-red-700">{(calendarSyncMutation.error as Error).message}</Text>
      ) : null}
      {calendarSyncMutation.isSuccess ? (
        <Text className="mb-4 text-xs text-calm">
          {calendarSyncMutation.data} activité{calendarSyncMutation.data > 1 ? 's' : ''} ajoutée
          {calendarSyncMutation.data > 1 ? 's' : ''} au calendrier « Regain ».
        </Text>
      ) : null}

      {planQuery.isLoading ? <ActivityIndicator color="#FF6B57" /> : null}

      {allDone ? (
        <View className="items-center rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <Text className="mb-2 text-3xl">🎉</Text>
          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-center text-base text-ink">
            Tout est fait pour cette semaine
          </Text>
          <Text className="mt-1 text-center text-xs text-ink-soft">
            Retrouvez ce que vous avez accompli dans l'Historique, sur l'onglet Suivi.
          </Text>
        </View>
      ) : null}

      {days.map((date) => {
        const items = activeItems.filter((item) => item.date === date);
        return (
          <View key={date} className="mb-5">
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2 text-sm text-ink-soft">
              {formatDayLabel(date)}
            </Text>
            {items.map((item) => (
              <ActivityCard
                key={item.id}
                item={item}
                onToggle={() => toggleMutation.mutate(item)}
                toggling={toggleMutation.isPending && toggleMutation.variables?.id === item.id}
              />
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}
