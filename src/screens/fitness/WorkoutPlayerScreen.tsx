import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';

import { goBack } from '../../lib/navigation';
import { useEffect, useReducer, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, errorMessage, InlineNotice, LoadingSkeleton } from '../../components/feedback';
import { Button, Card, haptic, IconButton, ProgressBar, ProgressRing, Screen, Sheet, Text, Thumbnail } from '../../components/ui';
import { sessionTitle } from '../../features/fitness/schedule';
import type { WorkoutSession } from '../../features/fitness/types';
import { useFitness } from '../../hooks/useFitness';
import { logWorkout } from '../../lib/fitness';
import { imageForExercise, imageForWorkout } from '../../theme/images';
import { useTheme } from '../../theme/ThemeProvider';
import { t } from '../../lib/i18n';

type Position = { exercise: number; set: number };
type State =
  | { stage: 'intro' }
  | ({ stage: 'exercise' } & Position)
  | { stage: 'rest'; next: Position; left: number; total: number }
  | { stage: 'cooldown' }
  | { stage: 'done' };
type Action = 'start' | 'nextSet' | 'prevSet' | 'plusSet' | 'back' | 'tick' | 'skipRest' | 'finish';

function reducer(session: WorkoutSession) {
  const exercises = session.exercises;
  return (state: State, action: Action): State => {
    switch (action) {
      case 'start':
        return { stage: 'exercise', exercise: 0, set: 0 };
      case 'nextSet': {
        if (state.stage !== 'exercise') return state;
        const current = exercises[state.exercise];
        const rest = current.rest_seconds;
        if (state.set + 1 < current.sets) return { stage: 'rest', next: { exercise: state.exercise, set: state.set + 1 }, left: rest, total: rest };
        if (state.exercise + 1 < exercises.length) return { stage: 'rest', next: { exercise: state.exercise + 1, set: 0 }, left: rest, total: rest };
        return { stage: 'cooldown' };
      }
      case 'prevSet':
        return state.stage === 'exercise' ? { ...state, set: Math.max(0, state.set - 1) } : state;
      case 'plusSet':
        return state.stage === 'exercise' ? { ...state, set: Math.min(exercises[state.exercise].sets - 1, state.set + 1) } : state;
      case 'back':
        if (state.stage === 'exercise') return state.exercise > 0 ? { stage: 'exercise', exercise: state.exercise - 1, set: 0 } : { stage: 'intro' };
        if (state.stage === 'rest') return { stage: 'exercise', ...state.next };
        if (state.stage === 'cooldown') return { stage: 'exercise', exercise: exercises.length - 1, set: 0 };
        return state;
      case 'tick':
        if (state.stage !== 'rest') return state;
        return state.left <= 1 ? { stage: 'exercise', ...state.next } : { ...state, left: state.left - 1 };
      case 'skipRest':
        return state.stage === 'rest' ? { stage: 'exercise', ...state.next } : state;
      case 'finish':
        return { stage: 'done' };
    }
  };
}

function formatSeconds(total: number): string {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function Player({ session, sessionIndex, planId }: { session: WorkoutSession; sessionIndex: number; planId: string }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const userId = useFitness().userId;
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(reducer(session), { stage: 'intro' });
  const [confirmExit, setConfirmExit] = useState(false);
  const startedAt = useRef<number | null>(null);
  const exercises = session.exercises;
  const title = sessionTitle(session);

  const logMutation = useMutation({
    mutationFn: () =>
      logWorkout(userId!, {
        planId,
        sessionIndex,
        focus: session.focus,
        durationMinutes: startedAt.current ? (Date.now() - startedAt.current) / 60_000 : session.duration_minutes,
      }),
    onSuccess: () => {
      haptic.success();
      queryClient.invalidateQueries({ queryKey: ['workoutLogs', userId] });
      dispatch('finish');
    },
  });

  useEffect(() => {
    if (state.stage !== 'rest') return;
    const timer = setInterval(() => dispatch('tick'), 1000);
    return () => clearInterval(timer);
  }, [state.stage]);

  useEffect(() => {
    if (state.stage === 'exercise') haptic.light();
  }, [state.stage]);

  const inProgress = state.stage === 'exercise' || state.stage === 'rest' || state.stage === 'cooldown';
  const close = () => (inProgress ? setConfirmExit(true) : goBack('/(tabs)/fitness'));

  const position = state.stage === 'exercise' ? state : state.stage === 'rest' ? state.next : null;
  const progress = position ? (position.exercise + (state.stage === 'exercise' ? state.set / exercises[position.exercise].sets : 0)) / exercises.length : state.stage === 'cooldown' ? 1 : 0;

  const topBar = (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
      <View style={{ marginLeft: -10 }}>
        {state.stage === 'intro' || state.stage === 'done' ? (
          <IconButton icon="close" label={t('Close')} onPress={close} />
        ) : (
          <IconButton icon="chevron-back" label={t('Previous exercise')} onPress={() => dispatch('back')} size={26} />
        )}
      </View>
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        {position ? (
          <>
            <Text variant="caption" tone="ink2" center>
              {t('Exercise {number} of {count}', { number: position.exercise + 1, count: exercises.length })}
            </Text>
            <View style={{ marginTop: 6 }}>
              <ProgressBar progress={progress} height={6} />
            </View>
          </>
        ) : null}
      </View>
      <View style={{ marginRight: -10 }}>
        {inProgress ? <IconButton icon="close" label={t('Stop the session')} onPress={close} /> : <View style={{ width: 44 }} />}
      </View>
    </View>
  );

  let content;
  let footer;
  if (state.stage === 'intro') {
    content = (
      <>
        <Text variant="title">{title}</Text>
        <Text variant="bodySm" tone="ink2" style={{ marginTop: 6 }}>
          {t('{minutes} min · {count} exercises', { minutes: session.duration_minutes, count: exercises.length })}
        </Text>
        <View style={{ marginTop: 18 }}>
          <Thumbnail source={imageForWorkout(session.focus)} width="100%" height={180} radius={20} icon="barbell-outline" />
        </View>
        <Card variant="tinted" style={{ marginTop: 18 }}>
          <Text variant="label">{t('🔥 Warm-up')}</Text>
          <Text variant="bodySm" tone="ink2" style={{ marginTop: 4 }}>
            {session.warmup}
          </Text>
        </Card>
        <Text variant="section" style={{ marginTop: 24, marginBottom: 8 }}>
          {t('Coming up')}
        </Text>
        {exercises.map((exercise, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.divider }}>
            <Text variant="label" tone="ink3" tabular style={{ width: 28 }}>
              {i + 1}
            </Text>
            <Thumbnail
              source={imageForExercise(exercise.name, session?.focus)}
              width={44}
              height={44}
              radius={10}
              icon="barbell-outline"
            />
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text variant="label">{exercise.name}</Text>
              <Text variant="caption" tone="ink2">
                {t('{sets} sets · {reps} reps · {rest} s rest', { sets: exercise.sets, reps: exercise.reps, rest: exercise.rest_seconds })}
              </Text>
            </View>
          </View>
        ))}
      </>
    );
    footer = (
      <Button
        label={t('Start')}
        icon="play"
        onPress={() => {
          startedAt.current = Date.now();
          dispatch('start');
        }}
      />
    );
  } else if (state.stage === 'exercise') {
    const exercise = exercises[state.exercise];
    const lastSet = state.set + 1 >= exercise.sets;
    const lastExercise = state.exercise + 1 >= exercises.length;
    content = (
      <Animated.View key={`${state.exercise}`} entering={FadeIn.duration(220)}>
        <Text variant="title">{exercise.name}</Text>
        <Text variant="bodySm" tone="ink2" style={{ marginTop: 4 }}>
          {t('{sets} sets · {reps} reps', { sets: exercise.sets, reps: exercise.reps })}
        </Text>
        <View style={{ marginTop: 16 }}>
          <Thumbnail source={imageForWorkout(session.focus)} width="100%" height={220} radius={20} icon="barbell-outline" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 24 }}>
          <IconButton icon="chevron-back" label={t('Previous set')} variant="surface" onPress={() => dispatch('prevSet')} />
          <View style={{ alignItems: 'center' }} accessible accessibilityLabel={t('Set {set} of {sets}', { set: state.set + 1, sets: exercise.sets })}>
            <Text variant="metric" tabular>
              {state.set + 1}
              <Text variant="section" tone="ink2">{` / ${exercise.sets}`}</Text>
            </Text>
            <Text variant="caption" tone="ink2">
              {t('set')}
            </Text>
          </View>
          <IconButton icon="chevron-forward" label={t('Next set')} variant="surface" onPress={() => dispatch('plusSet')} />
        </View>
        {exercise.tip ? (
          <Card variant="tinted" padding={14} style={{ marginTop: 20 }}>
            <Text variant="caption" tone="ink2">
              💡 {exercise.tip}
            </Text>
          </Card>
        ) : null}
      </Animated.View>
    );
    footer = (
      <Button
        label={!lastSet ? t('Next set') : lastExercise ? t('Cool-down') : t('Next exercise')}
        iconRight="arrow-forward"
        onPress={() => dispatch('nextSet')}
      />
    );
  } else if (state.stage === 'rest') {
    const nextExercise = exercises[state.next.exercise];
    content = (
      <View style={{ alignItems: 'center', paddingTop: 24 }}>
        <Text variant="overline" tone="ink2">
          {t('Rest')}
        </Text>
        <View style={{ marginTop: 20 }}>
          <ProgressRing progress={state.left / state.total} size={220} strokeWidth={12} animate={false} accessibilityLabel={t('Rest, {seconds} seconds left', { seconds: state.left })}>
            <Text variant="display" tabular>
              {formatSeconds(state.left)}
            </Text>
          </ProgressRing>
        </View>
        <Text variant="bodySm" tone="ink2" center style={{ marginTop: 24 }}>
          {t('Next: {exercise}, set {set} of {sets}', { exercise: nextExercise.name, set: state.next.set + 1, sets: nextExercise.sets })}
        </Text>
      </View>
    );
    footer = <Button label={t('Skip the rest')} variant="secondary" iconRight="play-skip-forward" onPress={() => dispatch('skipRest')} />;
  } else if (state.stage === 'cooldown') {
    content = (
      <View style={{ paddingTop: 12 }}>
        <Text variant="title">{t('Cool-down')}</Text>
        <Card variant="tinted" style={{ marginTop: 18 }}>
          <Text variant="body">🧘 {session.cooldown}</Text>
        </Card>
        {logMutation.isError ? <InlineNotice tone="error" message={errorMessage(logMutation.error)} /> : null}
      </View>
    );
    footer = <Button label={t('Finish the session')} icon="checkmark" loading={logMutation.isPending} onPress={() => logMutation.mutate()} />;
  } else {
    content = (
      <View style={{ alignItems: 'center', paddingTop: 60 }}>
        <Animated.View entering={ZoomIn.duration(260)}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: theme.primary600, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark" size={46} color={theme.dark ? theme.bg : '#FFFFFF'} />
          </View>
        </Animated.View>
        <Text variant="title" center style={{ marginTop: 24 }}>
          {t('Session complete')}
        </Text>
        <Text variant="body" tone="ink2" center style={{ marginTop: 8 }}>
          {t('{title} · {count} exercises. Well done — take the time to recover properly.', { title, count: exercises.length })}
        </Text>
      </View>
    );
    footer = <Button label={t('Back to Fitness')} onPress={() => goBack('/(tabs)/fitness')} />;
  }

  return (
    <Screen footer={footer}>
      <View style={{ paddingTop: insets.top > 0 ? 0 : 8 }}>{topBar}</View>
      {content}
      <Sheet
        visible={confirmExit}
        title={t('Stop the session?')}
        subtitle={t('Your progress in this session will not be saved.')}
        onClose={() => setConfirmExit(false)}
        scroll={false}
        footer={
          <View style={{ gap: 8 }}>
            <Button label={t('Carry on')} onPress={() => setConfirmExit(false)} />
            <Button
              label={t('Stop')}
              variant="ghost"
              onPress={() => {
                setConfirmExit(false);
                goBack('/(tabs)/fitness');
              }}
            />
          </View>
        }
      >
        <View />
      </Sheet>
    </Screen>
  );
}

/** The workout player: one exercise at a time, readable at a glance. */
export default function WorkoutPlayerScreen() {
  const { index } = useLocalSearchParams<{ index: string }>();
  const fitness = useFitness();
  const sessionIndex = Number(index ?? 0);
  const session = fitness.plan?.program[sessionIndex];

  if (fitness.isLoading) {
    return (
      <Screen>
        <LoadingSkeleton preset="hero" />
      </Screen>
    );
  }
  if (!fitness.plan || !session) {
    return (
      <Screen>
        <EmptyState icon="barbell-outline" title={t('Session not found')} body={t('It may have changed with your last check-in.')} actionLabel={t('Go back')} onAction={() => goBack('/(tabs)/fitness')} />
      </Screen>
    );
  }
  return <Player session={session} sessionIndex={sessionIndex} planId={fitness.plan.id} />;
}
