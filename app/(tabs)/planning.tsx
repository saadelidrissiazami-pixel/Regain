import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut, FadeOutRight, ZoomIn } from 'react-native-reanimated';
import { Text } from '../../src/components/typography';
import { CategoryBadge } from '../../src/components/CategoryBadge';
import { EnergyCheckin } from '../../src/components/EnergyCheckin';
import { Appear, Chevron, haptic, PressableScale, ProgressBar, Skeleton, Wiggle } from '../../src/components/motion';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import type { AvailabilitySlot } from '../../src/features/availability/types';
import { resolveStartTime } from '../../src/features/planning/schedule';
import { buildWeekView, formatCountdown, greetingFor, isOver, minutesUntil, todaySubtitle } from '../../src/features/planning/weekView';
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
import { useTheme } from '../../src/theme/ThemeProvider';

const MONO = { fontFamily: 'IBMPlexMono_500Medium' } as const;
const DISPLAY = { fontFamily: 'BricolageGrotesque_800ExtraBold' } as const;
const BOLD = { fontFamily: 'Figtree_700Bold' } as const;

function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={BOLD} className="mb-2 text-[11px] uppercase tracking-wide text-ink-soft">
      {children}
    </Text>
  );
}

function CheckButton({ checked, onPress, busy, title }: { checked: boolean; onPress: () => void; busy: boolean; title: string }) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={busy}
      scaleTo={0.85}
      feedback={null}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={`Marquer « ${title} » comme fait`}
      className={`h-9 w-9 items-center justify-center rounded-full ${checked ? 'bg-primary' : 'border-2 border-line'}`}
    >
      {checked ? (
        <Animated.View entering={ZoomIn.springify().damping(10)}>
          <Text className="text-sm text-on-primary">✓</Text>
        </Animated.View>
      ) : null}
    </PressableScale>
  );
}

/** Activité suivante, mise en avant en haut de l'écran. */
function NextCard({
  item,
  startTime,
  countdown,
  dayLabel,
  onToggle,
  toggling,
}: {
  item: PlannedActivityRow;
  startTime: string;
  countdown: string | null;
  dayLabel: string | null;
  onToggle: () => void;
  toggling: boolean;
}) {
  const activity = item.activities_catalog;
  const when = [startTime, countdown ?? dayLabel].filter(Boolean).join(' · ');
  return (
    <Appear index={1} exiting={FadeOutRight.duration(280)}>
      <SectionLabel>À suivre</SectionLabel>
      <View className="mb-5 rounded-3xl bg-surface p-5 shadow-sm">
        <Text style={MONO} className="text-xs text-primary">
          {when}
        </Text>
        <Text style={DISPLAY} className="mt-1 text-[22px] leading-7 text-ink">
          {activity.title}
        </Text>
        <View className="mt-2 flex-row items-center">
          <CategoryBadge category={activity.category} />
          <Text className="ml-2 text-xs text-ink-soft">{activity.duration_minutes} min</Text>
        </View>
        <View className="mt-4 flex-row items-center justify-between">
          <Link href={`/activity/${activity.id}`} asChild>
            <PressableScale feedback="medium" className="rounded-full bg-ink px-5 py-3">
              <Text style={DISPLAY} className="text-sm text-paper">
                C'est parti
              </Text>
            </PressableScale>
          </Link>
          <CheckButton checked={toggling} onPress={onToggle} busy={toggling} title={activity.title} />
        </View>
      </View>
    </Appear>
  );
}

/** Ligne compacte : heure, activité, coche. */
function ActivityRow({
  item,
  startTime,
  index,
  onToggle,
  toggling,
}: {
  item: PlannedActivityRow;
  startTime: string;
  index: number;
  onToggle: () => void;
  toggling: boolean;
}) {
  const activity = item.activities_catalog;
  return (
    <Appear index={index} exiting={FadeOutRight.duration(280)}>
      <View className={`mb-2 flex-row items-center rounded-2xl px-4 py-3.5 ${toggling ? 'bg-primary-soft' : 'bg-surface'}`}>
        <Text style={MONO} className="w-12 text-xs text-ink-soft">
          {startTime}
        </Text>
        <Link href={`/activity/${activity.id}`} asChild>
          <Pressable className="flex-1 pr-3">
            <Text style={BOLD} className={`text-[15px] ${toggling ? 'text-ink-soft line-through' : 'text-ink'}`}>
              {activity.title}
            </Text>
            <View className="mt-1 flex-row items-center">
              <CategoryBadge category={activity.category} />
              <Text className="ml-2 text-xs text-ink-soft">{activity.duration_minutes} min</Text>
            </View>
          </Pressable>
        </Link>
        <CheckButton checked={toggling} onPress={onToggle} busy={toggling} title={activity.title} />
      </View>
    </Appear>
  );
}

export default function PlanningScreen() {
  const theme = useTheme();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const weekStart = useWeekStart();
  const today = useToday();
  const [now] = useState(() => new Date());
  const hour = now.getHours();
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
  const isToggling = (item: PlannedActivityRow) => toggleMutation.isPending && toggleMutation.variables?.id === item.id;

  const calendarSyncMutation = useMutation({
    mutationFn: () => syncWeekPlanToCalendar(planQuery.data ?? [], availabilityQuery.data ?? [], weekStart),
    onSuccess: () => haptic.success(),
  });

  const availability: AvailabilitySlot[] = availabilityQuery.data ?? [];
  const hasAvailability = availability.length > 0;
  const view = buildWeekView(planQuery.data ?? [], today);
  const hasPlan = view.totalCount > 0;
  const allDone = hasPlan && view.doneCount === view.totalCount;
  const hasPending = view.upcomingDays.length > 0 || view.pastPending.length > 0;

  const startOf = (item: PlannedActivityRow) => resolveStartTime(item, availability);
  // Activités à venir triées par jour puis par heure : la première est « à suivre ».
  const upcoming = view.upcomingDays.flatMap(({ items }) =>
    [...items].sort((a, b) => startOf(a).localeCompare(startOf(b)))
  );
  // Ce qui est déjà fini aujourd'hui (non coché) ne peut pas être « à suivre » : rangé à part.
  const over = (item: PlannedActivityRow) =>
    item.date === today && isOver(item.date, startOf(item), item.activities_catalog.duration_minutes, now);
  const earlierToday = upcoming.filter(over);
  const active = upcoming.filter((item) => !over(item));
  const next = active[0];
  const rest = active.slice(1);
  const pendingToday = active.filter((item) => item.date === today).length;

  const nextStart = next ? startOf(next) : null;
  const countdown = next && nextStart && next.date === today ? formatCountdown(minutesUntil(next.date, nextStart, now)) : null;
  const nextDayLabel = next && next.date !== today ? formatDayLabel(next.date) : null;

  // Le reste, regroupé par jour.
  const restByDay = rest.reduce<{ date: string; items: PlannedActivityRow[] }[]>((groups, item) => {
    const last = groups[groups.length - 1];
    if (last && last.date === item.date) last.items.push(item);
    else groups.push({ date: item.date, items: [item] });
    return groups;
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const refetchAvailability = availabilityQuery.refetch;
  const refetchPlan = planQuery.refetch;
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchAvailability(), refetchPlan()]);
    setRefreshing(false);
  }, [refetchAvailability, refetchPlan]);

  let rowIndex = 2;

  return (
    <ScrollView
      className="flex-1 bg-paper"
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
    >
      {/* En-tête « ciel » : sa couleur suit le moment de la journée. */}
      <LinearGradient
        colors={[theme.sky, theme.skySoft, theme.paper]}
        locations={[0, 0.7, 1]}
        style={{ paddingTop: 64, paddingHorizontal: 20, paddingBottom: 28 }}
      >
        <Appear>
          <Text style={BOLD} className="text-sm text-ink-soft">
            {formatDayLabel(today)}
          </Text>
          <Text style={DISPLAY} className="mt-1 text-[36px] leading-[38px] text-ink">
            {greetingFor(hour)}
          </Text>
          <Text className="mt-1.5 text-[15px] text-ink-soft">
            {hasPlan ? (allDone ? 'Semaine bouclée, bravo' : todaySubtitle(pendingToday, hour)) : 'Votre semaine reste à construire'}
          </Text>
          {hasPlan ? (
            <View className="mt-5">
              <View className="mb-2 flex-row items-center justify-between">
                <Text style={BOLD} className="text-xs text-ink">
                  Cette semaine
                </Text>
                <Text style={MONO} className="text-xs text-ink-soft">
                  {view.doneCount} sur {view.totalCount} faites
                </Text>
              </View>
              <ProgressBar progress={view.doneCount / view.totalCount} color={theme.primary} trackColor={theme.surface} height={8} />
            </View>
          ) : null}
        </Appear>
      </LinearGradient>

      <View className="px-5">
        {planQuery.isLoading ? (
          <View>
            <Skeleton height={20} style={{ width: 90 }} />
            <Skeleton height={170} style={{ borderRadius: 24 }} />
            <Skeleton height={64} />
            <Skeleton height={64} />
          </View>
        ) : null}

        {!planQuery.isLoading && !hasPlan ? (
          <Appear index={1}>
            {hasAvailability ? (
              <View className="mb-5 rounded-3xl bg-surface p-5 shadow-sm">
                <Text style={DISPLAY} className="text-lg text-ink">
                  Prêt pour la semaine ?
                </Text>
                <Text className="mb-4 mt-1 text-sm text-ink-soft">
                  Regain place des activités dans vos disponibilités, selon votre énergie du moment.
                </Text>
                <PrimaryButton
                  label="Générer mon planning"
                  onPress={() => generateMutation.mutate()}
                  loading={generateMutation.isPending}
                />
              </View>
            ) : (
              <View className="mb-5 rounded-3xl bg-surface p-5 shadow-sm">
                <Text style={DISPLAY} className="text-lg text-ink">
                  Commençons par vos disponibilités
                </Text>
                <Text className="mb-4 mt-1 text-sm text-ink-soft">
                  Dites à Regain quand vous êtes libre, il vous propose ensuite quoi faire.
                </Text>
                <Link href="/availability" asChild>
                  <PressableScale feedback="medium" className="items-center rounded-full bg-ink px-5 py-4">
                    <Text style={DISPLAY} className="text-base text-paper">
                      Ajouter mes disponibilités
                    </Text>
                  </PressableScale>
                </Link>
              </View>
            )}
          </Appear>
        ) : null}

        {next && nextStart ? (
          <NextCard
            key={next.id}
            item={next}
            startTime={nextStart}
            countdown={countdown}
            dayLabel={nextDayLabel}
            onToggle={() => toggle(next)}
            toggling={isToggling(next)}
          />
        ) : null}

        {allDone ? (
          <Animated.View entering={ZoomIn.springify().damping(14)}>
            <View className="mb-5 items-center rounded-3xl bg-surface p-6 shadow-sm">
              <Wiggle>
                <Text className="mb-2 text-4xl">🎉</Text>
              </Wiggle>
              <Text style={DISPLAY} className="text-center text-base text-ink">
                Tout est fait pour cette semaine
              </Text>
              <Text className="mt-1 text-center text-xs text-ink-soft">
                Retrouvez ce que vous avez accompli dans l'onglet Suivi.
              </Text>
            </View>
          </Animated.View>
        ) : null}

        <Appear index={2}>
          <EnergyCheckin userId={userId} />
        </Appear>

        {earlierToday.length > 0 ? (
          <View className="mb-3">
            <SectionLabel>Plus tôt aujourd'hui</SectionLabel>
            {earlierToday.map((item) => (
              <ActivityRow
                key={item.id}
                item={item}
                startTime={startOf(item)}
                index={rowIndex++}
                onToggle={() => toggle(item)}
                toggling={isToggling(item)}
              />
            ))}
          </View>
        ) : null}

        {restByDay.map(({ date, items }) => (
          <View key={date} className="mb-3">
            <SectionLabel>{date === today ? "Plus tard aujourd'hui" : formatDayLabel(date)}</SectionLabel>
            {items.map((item) => (
              <ActivityRow
                key={item.id}
                item={item}
                startTime={startOf(item)}
                index={rowIndex++}
                onToggle={() => toggle(item)}
                toggling={isToggling(item)}
              />
            ))}
          </View>
        ))}

        {view.pastPending.length > 0 ? (
          <Appear index={rowIndex}>
            <View className="mb-5 overflow-hidden rounded-2xl bg-surface">
              <Pressable
                onPress={() => {
                  haptic.selection();
                  setShowPast((v) => !v);
                }}
                className="flex-row items-center justify-between px-4 py-3.5"
              >
                <View className="flex-1 pr-3">
                  <Text style={BOLD} className="text-sm text-ink">
                    Jours passés
                  </Text>
                  <Text className="mt-0.5 text-xs text-ink-soft">
                    {view.pastPending.length} activité{view.pastPending.length > 1 ? 's' : ''} non cochée
                    {view.pastPending.length > 1 ? 's' : ''}. Faites quand même ? Cochez-les.
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
                        <ActivityRow
                          item={item}
                          startTime={startOf(item)}
                          index={0}
                          onToggle={() => toggle(item)}
                          toggling={isToggling(item)}
                        />
                      </View>
                    ))}
                  </View>
                </Animated.View>
              ) : null}
            </View>
          </Appear>
        ) : null}

        {/* Actions secondaires, en bas : l'écran parle d'abord de ce qu'il y a à faire. */}
        <View className="mt-2 gap-2.5">
          {hasPlan ? (
            <PressableScale
              onPress={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              scaleTo={0.98}
              className="items-center rounded-full border border-line px-4 py-3.5"
            >
              {generateMutation.isPending ? (
                <ActivityIndicator className="text-primary" />
              ) : (
                <Text style={BOLD} className="text-sm text-ink">
                  Régénérer mon planning
                </Text>
              )}
            </PressableScale>
          ) : null}
          {generateMutation.isError ? (
            <Text className="text-xs text-red-700">{(generateMutation.error as Error).message}</Text>
          ) : null}

          <Link href="/availability" asChild>
            <PressableScale scaleTo={0.98} className="flex-row items-center justify-between rounded-full border border-line px-5 py-3.5">
              <Text style={BOLD} className="text-sm text-ink">
                Gérer mes disponibilités
              </Text>
              <Text className="text-base text-primary">→</Text>
            </PressableScale>
          </Link>

          {hasPending && calendarUnavailableReason ? (
            <Text className="mt-1 text-center text-xs text-ink-soft">{calendarUnavailableReason}</Text>
          ) : hasPending ? (
            <PressableScale
              onPress={() => calendarSyncMutation.mutate()}
              disabled={calendarSyncMutation.isPending}
              scaleTo={0.98}
              className="items-center rounded-full border border-line px-4 py-3.5"
            >
              {calendarSyncMutation.isPending ? (
                <ActivityIndicator className="text-primary" />
              ) : (
                <Text style={BOLD} className="text-sm text-ink">
                  Synchroniser avec mon calendrier
                </Text>
              )}
            </PressableScale>
          ) : null}
          {calendarSyncMutation.isError ? (
            <Text className="text-xs text-red-700">{(calendarSyncMutation.error as Error).message}</Text>
          ) : null}
          {calendarSyncMutation.isSuccess ? (
            <Animated.View entering={FadeIn}>
              <Text className="text-center text-xs text-calm">
                {calendarSyncMutation.data} activité{calendarSyncMutation.data > 1 ? 's' : ''} ajoutée
                {calendarSyncMutation.data > 1 ? 's' : ''} au calendrier « Regain ».
              </Text>
            </Animated.View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}
