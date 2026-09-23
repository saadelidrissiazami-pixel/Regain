import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { EnergyPromptCard } from '../../components/cards/EnergyPromptCard';
import { EnergySelector } from '../../components/cards/EnergySelector';
import { NextUpCard } from '../../components/cards/NextUpCard';
import { NowCard } from '../../components/cards/NowCard';
import { WeekProgressCard } from '../../components/cards/WeekProgressCard';
import { EmptyState, ErrorState, errorMessage, InlineNotice, LoadingSkeleton } from '../../components/feedback';
import { Appear, Avatar, Button, Card, ListRow, PressableScale, Screen, ScreenHeader, SectionHeader, Sheet, Text } from '../../components/ui';
import { formatCountdown, greetingFor, isOver, minutesUntil, coachLine } from '../../features/planning/weekView';
import { useCommitments } from '../../hooks/useCommitments';
import { useEnergyToday } from '../../hooks/useEnergyToday';
import { usePlanning } from '../../hooks/usePlanning';
import { calendarUnavailableReason } from '../../lib/deviceCalendar';
import { formatDayLabel } from '../../lib/formatDate';
import type { PlannedActivityRow } from '../../lib/planning';
import { firstNameOf } from '../../lib/profile';
import { relativeDayLabel } from '../../features/fitness/schedule';
import { useAuthStore } from '../../store/authStore';
import { activityReason } from './reason';

/** Accueil : « Que dois-je faire maintenant ? » */
export default function PlanningHomeScreen() {
  const planning = usePlanning();
  const commitments = useCommitments();
  const energy = useEnergyToday();
  const email = useAuthStore((s) => s.session?.user.email ?? '');
  const { today, view, planQuery, availabilityQuery, generateMutation, calendarSyncMutation, startOf } = planning;
  const [now] = useState(() => new Date());
  const hour = now.getHours();
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const hasAvailability = planning.availability.length > 0;
  const hasPlan = view.totalCount > 0;
  const allDone = hasPlan && view.doneCount === view.totalCount;

  // Activités à venir triées par jour puis par heure. Ce qui est déjà fini aujourd'hui (non coché)
  // ne peut pas être « maintenant » : il reste à cocher depuis la semaine.
  const upcoming = view.upcomingDays.flatMap(({ items }) => [...items].sort((a, b) => startOf(a).localeCompare(startOf(b))));
  const over = (item: PlannedActivityRow) =>
    item.date === today && isOver(item.date, startOf(item), item.activities_catalog.duration_minutes, now);
  const active = upcoming.filter((item) => !over(item));
  const toCheck = upcoming.filter(over).length + view.pastPending.length;
  const next = active[0];
  const after = active[1];
  // Trois au maximum : l'écran d'accueil propose, il ne récite pas l'agenda de la semaine.
  const aVenir = commitments.filter((engagement) => engagement.status === 'a_faire').slice(0, 3);
  const pendingToday = active.filter((item) => item.date === today).length;

  const name = firstNameOf(planning.profile);
  const whenOf = (item: PlannedActivityRow) => {
    const start = startOf(item);
    if (item.date === today) {
      const countdown = formatCountdown(minutesUntil(item.date, start, now));
      return [start, countdown ?? 'en cours'].join(' · ');
    }
    return `${relativeDayLabel(item.date, today, formatDayLabel)} · ${start}`;
  };

  const loading = planQuery.isLoading || availabilityQuery.isLoading;

  return (
    <Screen inTabs refreshing={planning.refreshing} onRefresh={planning.refresh}>
      <ScreenHeader
        overline={formatDayLabel(today)}
        title={`${greetingFor(hour)}${name ? `, ${name}` : ''} 👋`}
        subtitle={coachLine({ hasPlan, doneCount: view.doneCount, totalCount: view.totalCount, pendingToday, hour })}
        size="display"
        right={
          <PressableScale onPress={() => router.navigate('/(tabs)/profile')} accessibilityRole="button" accessibilityLabel="Mon profil">
            <Avatar name={name ?? email} size={44} />
          </PressableScale>
        }
      />

      <Appear index={0}>
        <EnergyPromptCard />
      </Appear>

      <View style={{ height: 16 }} />

      {loading ? (
        <LoadingSkeleton preset="hero" />
      ) : planQuery.isError ? (
        <ErrorState
          title="Ton planning n'a pas pu se charger"
          onRetry={() => planQuery.refetch()}
          retrying={planQuery.isFetching}
        />
      ) : !hasPlan ? (
        <Appear index={1}>
          {hasAvailability ? (
            <EmptyState
              icon="sparkles-outline"
              title="On prépare ta semaine ?"
              body="Regain place des activités dans tes disponibilités, selon ton énergie et tes objectifs."
              actionLabel="Préparer ma semaine"
              onAction={() => generateMutation.mutate()}
              actionLoading={generateMutation.isPending}
            />
          ) : (
            <EmptyState
              icon="time-outline"
              title="Commençons par tes disponibilités"
              body="Dis à Regain quand tu es libre : il te propose ensuite quoi faire, au bon moment."
              actionLabel="Ajouter mes disponibilités"
              onAction={() => router.push('/availability')}
            />
          )}
          {generateMutation.isError ? <InlineNotice tone="error" message={errorMessage(generateMutation.error)} /> : null}
        </Appear>
      ) : next ? (
        <Appear index={1}>
          <NowCard
            key={next.id}
            label={next.date === today ? 'Maintenant' : 'À suivre'}
            when={whenOf(next)}
            activity={next.activities_catalog}
            reason={activityReason(next.activities_catalog, planning.preferences)}
            done={false}
            toggling={planning.isToggling(next)}
            onToggle={() => planning.toggle(next)}
            onStart={() => router.push(`/activity/${next.activities_catalog.id}`)}
            footer={
              <>
                <Text variant="label" style={{ marginBottom: 10 }}>
                  Comment te sens-tu maintenant ?
                </Text>
                <EnergySelector value={energy.level} onChange={energy.save} savingLevel={energy.savingLevel} disabled={energy.saving} />
              </>
            }
          />
        </Appear>
      ) : (
        <Appear index={1}>
          <EmptyState
            icon={allDone ? 'trophy-outline' : 'moon-outline'}
            title={allDone ? 'Tout est fait pour cette semaine' : "Plus rien de prévu d'ici la fin de la semaine"}
            body={
              allDone
                ? 'Bravo. Retrouve ce que tu as accompli dans Suivi.'
                : 'Profite de ce temps libre, ou ajoute une activité si l’envie est là.'
            }
            actionLabel={allDone ? 'Voir mes progrès' : 'Ajouter une activité'}
            onAction={() => (allDone ? router.navigate('/(tabs)/tracking') : router.push('/planning/add'))}
          />
        </Appear>
      )}

      {toCheck > 0 && hasPlan ? (
        <Appear index={2}>
          <Card variant="flat" padding={4} style={{ marginTop: 12 }}>
            <View style={{ paddingHorizontal: 12 }}>
              <ListRow
                icon="checkmark-done-outline"
                title={`${toCheck} activité${toCheck > 1 ? 's' : ''} à cocher`}
                subtitle="Déjà faite ? Coche-la depuis ta semaine."
                onPress={() => router.push('/planning/week')}
                compact
              />
            </View>
          </Card>
        </Appear>
      ) : null}

      {after ? (
        <Appear index={3}>
          <View style={{ marginTop: 28 }}>
            <SectionHeader title="Ensuite" actionLabel="Voir la semaine" onAction={() => router.push('/planning/week')} />
            <NextUpCard
              when={whenOf(after)}
              activity={after.activities_catalog}
              onPress={() => router.push(`/activity/${after.activities_catalog.id}`)}
            />
          </View>
        </Appear>
      ) : null}

      {hasPlan ? (
        <Appear index={4}>
          <View style={{ marginTop: after ? 16 : 28 }}>
            <WeekProgressCard done={view.doneCount} total={view.totalCount} onPress={() => router.push('/planning/week')} />
          </View>
        </Appear>
      ) : null}

      {/* Séances et courses : ce que la personne s'est engagée à faire, par opposition aux
          activités proposées plus haut, qu'elle peut ignorer sans rien devoir. On ne montre que
          ce qui reste à venir — un jour passé sans validation ne devient pas un reproche. */}
      {aVenir.length > 0 ? (
        <Appear index={5}>
          <View style={{ marginTop: 28 }}>
            <SectionHeader title="Tes engagements" actionLabel="Ma forme" onAction={() => router.push('/(tabs)/fitness')} />
            {aVenir.map((engagement, index) => (
              <ListRow
                key={engagement.id}
                icon={engagement.kind === 'courses' ? 'cart-outline' : 'barbell-outline'}
                title={engagement.title}
                subtitle={[
                  relativeDayLabel(engagement.date, today, formatDayLabel),
                  engagement.startTime,
                  `${engagement.durationMinutes} min`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                onPress={() => router.push(engagement.href)}
                divider={index < aVenir.length - 1}
              />
            ))}
          </View>
        </Appear>
      ) : null}

      {/* Actions secondaires : accessibles, mais sans concurrencer l'action du moment. */}
      <Appear index={6}>
        <View style={{ marginTop: 32 }}>
          <Text variant="overline" tone="ink2" style={{ marginBottom: 4 }}>
            Organiser ma semaine
          </Text>
          <ListRow icon="calendar-outline" title="Voir toute la semaine" onPress={() => router.push('/planning/week')} divider compact />
          <ListRow icon="time-outline" title="Mes disponibilités" onPress={() => router.push('/availability')} divider compact />
          {hasPlan ? (
            <ListRow
              icon="refresh-outline"
              title="Régénérer ma semaine"
              subtitle="Les activités déjà faites restent en place."
              onPress={() => setConfirmRegenerate(true)}
              divider
              compact
            />
          ) : null}
          {hasPlan && !calendarUnavailableReason ? (
            <ListRow
              icon="sync-outline"
              title={calendarSyncMutation.isPending ? 'Synchronisation…' : 'Synchroniser avec mon calendrier'}
              onPress={() => calendarSyncMutation.mutate()}
              compact
              chevron={false}
            />
          ) : null}
          {hasPlan && calendarUnavailableReason ? (
            <Text variant="caption" tone="ink2" style={{ marginTop: 8 }}>
              {calendarUnavailableReason}
            </Text>
          ) : null}
          {calendarSyncMutation.isError ? <InlineNotice tone="error" message={errorMessage(calendarSyncMutation.error)} /> : null}
          {calendarSyncMutation.isSuccess ? (
            <InlineNotice
              tone="success"
              message={`${calendarSyncMutation.data} activité${calendarSyncMutation.data > 1 ? 's' : ''} ajoutée${
                calendarSyncMutation.data > 1 ? 's' : ''
              } au calendrier « Regain ».`}
            />
          ) : null}
          {hasPlan && generateMutation.isError ? <InlineNotice tone="error" message={errorMessage(generateMutation.error)} /> : null}
          {hasPlan && generateMutation.isSuccess ? <InlineNotice tone="success" message="Ta semaine a été adaptée." /> : null}
        </View>
      </Appear>

      <Sheet
        visible={confirmRegenerate}
        title="Régénérer ta semaine ?"
        subtitle="Regain te propose de nouvelles activités. Celles que tu as déjà faites restent en place."
        onClose={() => setConfirmRegenerate(false)}
        scroll={false}
        footer={
          <View style={{ gap: 8 }}>
            <Button
              label="Régénérer"
              icon="refresh"
              loading={generateMutation.isPending}
              onPress={() => generateMutation.mutate(undefined, { onSettled: () => setConfirmRegenerate(false) })}
            />
            <Button label="Annuler" variant="ghost" onPress={() => setConfirmRegenerate(false)} />
          </View>
        }
      >
        <View />
      </Sheet>
    </Screen>
  );
}
