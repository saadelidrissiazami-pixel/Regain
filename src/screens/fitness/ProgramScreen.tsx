import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { SessionRow } from '../../components/cards/SessionRow';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback';
import { Appear, Card, IconButton, ProgressBar, Screen, ScreenHeader, SegmentedControl, Text } from '../../components/ui';
import { programPhase, uniqueExercises } from '../../features/fitness/schedule';
import { useFitness } from '../../hooks/useFitness';
import { formatDateTimeLabel } from '../../lib/formatDate';
import { fromLocalISODate, toLocalISODate } from '../../lib/week';
import { useTheme } from '../../theme/ThemeProvider';

type Tab = 'sessions' | 'exercises' | 'progress';

function tipsFor({ deload, strategy }: { deload: boolean; strategy: string | undefined }): string[] {
  return [
    'Privilégie une bonne qualité de sommeil',
    'Hydrate-toi suffisamment',
    deload ? 'Garde des charges confortables cette semaine' : strategy === 'surplus' ? 'Augmente les charges progressivement' : 'Soigne la technique avant la charge',
    'Écoute tes sensations',
  ];
}

/** Mon programme : les séances de la semaine, les exercices, la progression. */
export default function ProgramScreen() {
  const theme = useTheme();
  const fitness = useFitness();
  const { plan, profile } = fitness;
  const [tab, setTab] = useState<Tab>('sessions');

  const weekStartIso = fromLocalISODate(fitness.weekStart).toISOString();
  const doneThisWeek = new Set(fitness.logs.filter((l) => l.completed_at >= weekStartIso && l.plan_id === plan?.id).map((l) => l.session_index));

  const subtitle = plan
    ? [fitness.weekNumber ? `Semaine ${fitness.weekNumber}` : null, `Phase : ${programPhase(plan.targets.strategy)}`].filter(Boolean).join(' · ')
    : undefined;

  // Séances faites par semaine, sur les 4 dernières semaines.
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const start = fromLocalISODate(fitness.weekStart);
    start.setDate(start.getDate() - 7 * (3 - i));
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const count = fitness.logs.filter((l) => l.completed_at >= start.toISOString() && l.completed_at < end.toISOString()).length;
    return { label: i === 3 ? 'Cette semaine' : `Sem. du ${toLocalISODate(start).slice(8)}/${toLocalISODate(start).slice(5, 7)}`, count };
  });
  const target = profile?.days_per_week ?? 3;

  return (
    <Screen refreshing={fitness.isRefetching} onRefresh={() => fitness.refetch()}>
      <ScreenHeader
        title="Mon programme"
        subtitle={subtitle}
        onBack={() => router.back()}
        right={<IconButton icon="settings-outline" label="Mon profil forme" onPress={() => router.push('/fitness/questionnaire')} />}
      />

      {fitness.isLoading ? (
        <LoadingSkeleton preset="list" />
      ) : fitness.isError ? (
        <ErrorState onRetry={() => fitness.refetch()} />
      ) : !plan ? (
        <EmptyState
          icon="barbell-outline"
          title="Pas encore de programme"
          body="Génère ton programme depuis l'onglet Forme."
          actionLabel="Retour à Forme"
          onAction={() => router.back()}
        />
      ) : (
        <>
          <SegmentedControl
            label="Mon programme"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'sessions', label: 'Séances' },
              { value: 'exercises', label: 'Exercices' },
              { value: 'progress', label: 'Progression' },
            ]}
          />
          <View style={{ height: 18 }} />

          {tab === 'sessions' ? (
            <>
              {plan.program.map((session, i) => (
                <Appear key={i} index={i}>
                  <SessionRow session={session} done={doneThisWeek.has(i)} onPress={() => router.push(`/fitness/workout/${i}`)} />
                </Appear>
              ))}

              {fitness.deload ? (
                <Card variant="tinted" style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <Ionicons name="barbell" size={22} color={theme.primary700} />
                    <View style={{ flex: 1 }}>
                      <Text variant="label">Semaine allégée</Text>
                      <Text variant="caption" tone="ink2" style={{ marginTop: 3 }}>
                        Une série de moins par exercice, pour récupérer sans culpabiliser.
                      </Text>
                    </View>
                  </View>
                </Card>
              ) : null}

              <Card style={{ marginTop: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Ionicons name="bulb-outline" size={20} color={theme.yellow} />
                  <Text variant="label">Conseils de la semaine</Text>
                </View>
                {tipsFor({ deload: fitness.deload, strategy: plan.targets.strategy }).map((tip) => (
                  <View key={tip} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.primary600} />
                    <Text variant="bodySm" tone="ink2" style={{ flex: 1 }}>
                      {tip}
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          ) : tab === 'exercises' ? (
            uniqueExercises(plan.program).map((exercise, i) => (
              <Appear key={exercise.name} index={i}>
                <Card padding={16} style={{ marginBottom: 10 }}>
                  <Text variant="label">{exercise.name}</Text>
                  <Text variant="caption" tone="ink2" style={{ marginTop: 3 }}>
                    {exercise.sets} séries × {exercise.reps} · repos {exercise.rest_seconds} s · {exercise.sessions.join(', ')}
                  </Text>
                  {exercise.tip ? (
                    <Text variant="caption" tone="ink2" style={{ marginTop: 8 }}>
                      💡 {exercise.tip}
                    </Text>
                  ) : null}
                </Card>
              </Appear>
            ))
          ) : (
            <>
              <Card>
                <Text variant="label" style={{ marginBottom: 14 }}>
                  Séances faites par semaine
                </Text>
                {weeks.map((week) => (
                  <View key={week.label} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text variant="caption" tone="ink2">
                        {week.label}
                      </Text>
                      <Text variant="caption" tabular>
                        {week.count} / {target}
                      </Text>
                    </View>
                    <ProgressBar progress={week.count / target} height={6} />
                  </View>
                ))}
              </Card>

              <Card style={{ marginTop: 16 }}>
                <Text variant="label" style={{ marginBottom: 10 }}>
                  Tes bilans
                </Text>
                {fitness.checkins.length === 0 ? (
                  <Text variant="bodySm" tone="ink2">
                    Fais ton premier bilan en fin de semaine : ton poids et ton énergie apparaîtront ici.
                  </Text>
                ) : (
                  fitness.checkins.map((checkin) => (
                    <View
                      key={checkin.id}
                      style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.divider }}
                    >
                      <Text variant="caption" tone="ink2" style={{ flex: 1 }}>
                        {formatDateTimeLabel(checkin.created_at)}
                      </Text>
                      <Text variant="caption" tabular>
                        {checkin.weight_kg ? `${String(checkin.weight_kg).replace('.', ',')} kg · ` : ''}
                        {checkin.sessions_done} séance{checkin.sessions_done > 1 ? 's' : ''} · énergie {checkin.energy}/5
                      </Text>
                    </View>
                  ))
                )}
              </Card>
            </>
          )}
        </>
      )}
    </Screen>
  );
}
