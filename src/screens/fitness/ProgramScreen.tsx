import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { goBack } from '../../lib/navigation';
import { useState } from 'react';
import { View } from 'react-native';

import { SessionRow } from '../../components/cards/SessionRow';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback';
import { Appear, Card, IconButton, ProgressBar, Screen, ScreenHeader, SegmentedControl, Text } from '../../components/ui';
import { programPhase, uniqueExercises } from '../../features/fitness/schedule';
import { useFitness } from '../../hooks/useFitness';
import { formatDateTimeLabel } from '../../lib/formatDate';
import { fromLocalISODate } from '../../lib/week';
import { useTheme } from '../../theme/ThemeProvider';
import { locale, t } from '../../lib/i18n';

type Tab = 'sessions' | 'exercises' | 'progress';

function tipsFor({ deload, strategy }: { deload: boolean; strategy: string | undefined }): string[] {
  return [
    t('Protect the quality of your sleep'),
    t('Drink enough water'),
    deload ? t('Keep the weights comfortable this week') : strategy === 'surplus' ? t('Add weight gradually') : t('Get the technique right before the load'),
    t('Listen to how your body feels'),
  ];
}

/** My programme: the week's sessions, the exercises, the progress. */
export default function ProgramScreen() {
  const theme = useTheme();
  const fitness = useFitness();
  const { plan, profile } = fitness;
  const [tab, setTab] = useState<Tab>('sessions');

  const weekStartIso = fromLocalISODate(fitness.weekStart).toISOString();
  const doneThisWeek = new Set(fitness.logs.filter((l) => l.completed_at >= weekStartIso && l.plan_id === plan?.id).map((l) => l.session_index));

  const subtitle = plan
    ? [
        fitness.weekNumber ? t('Week {number}', { number: fitness.weekNumber }) : null,
        t('Phase: {phase}', { phase: programPhase(plan.targets.strategy) }),
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined;

  // Sessions done per week, over the last 4 weeks.
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const start = fromLocalISODate(fitness.weekStart);
    start.setDate(start.getDate() - 7 * (3 - i));
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const count = fitness.logs.filter((l) => l.completed_at >= start.toISOString() && l.completed_at < end.toISOString()).length;
    return { label: i === 3 ? t('This week') : t('Wk of {date}', { date: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric' }).format(start) }), count };
  });
  const target = profile?.days_per_week ?? 3;

  return (
    <Screen refreshing={fitness.isRefetching} onRefresh={() => fitness.refetch()}>
      <ScreenHeader
        title={t('My programme')}
        subtitle={subtitle}
        onBack={() => goBack('/(tabs)/fitness')}
        right={<IconButton icon="settings-outline" label={t('My fitness profile')} onPress={() => router.push('/fitness/questionnaire')} />}
      />

      {fitness.isLoading ? (
        <LoadingSkeleton preset="list" />
      ) : fitness.isError ? (
        <ErrorState onRetry={() => fitness.refetch()} />
      ) : !plan ? (
        <EmptyState
          icon="barbell-outline"
          title={t('No programme yet')}
          body={t('Build your programme from the Fitness tab.')}
          actionLabel={t('Back to Fitness')}
          onAction={() => goBack('/(tabs)/fitness')}
        />
      ) : (
        <>
          <SegmentedControl
            label={t('My programme')}
            value={tab}
            onChange={setTab}
            options={[
              { value: 'sessions', label: t('Sessions') },
              { value: 'exercises', label: t('Exercises') },
              { value: 'progress', label: t('Progression') },
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
                      <Text variant="label">{t('An easier week')}</Text>
                      <Text variant="caption" tone="ink2" style={{ marginTop: 3 }}>
                        {t('One set fewer per exercise, to recover without guilt.')}
                      </Text>
                    </View>
                  </View>
                </Card>
              ) : null}

              <Card style={{ marginTop: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Ionicons name="bulb-outline" size={20} color={theme.yellow} />
                  <Text variant="label">{t('This week’s pointers')}</Text>
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
                    {t('{sets} sets × {reps} · {rest} s rest · {sessions}', { sets: exercise.sets, reps: exercise.reps, rest: exercise.rest_seconds, sessions: exercise.sessions.join(', ') })}
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
                  {t('Sessions done per week')}
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
                  {t('Your check-ins')}
                </Text>
                {fitness.checkins.length === 0 ? (
                  <Text variant="bodySm" tone="ink2">
                    {t('Do your first check-in at the end of the week, and your weight and energy will show up here.')}
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
                        {checkin.weight_kg ? `${checkin.weight_kg.toLocaleString(locale)} kg · ` : ''}
                        {checkin.sessions_done > 1
                          ? t('{count} sessions · energy {energy}/5', { count: checkin.sessions_done, energy: checkin.energy })
                          : t('{count} session · energy {energy}/5', { count: checkin.sessions_done, energy: checkin.energy })}
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
