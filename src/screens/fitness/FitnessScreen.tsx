import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AdjustmentsList } from '../../components/AdjustmentsList';
import { AddFoodSheet } from '../../components/cards/AddFoodSheet';
import { CalorieProgressCard } from '../../components/cards/CalorieProgressCard';
import { PhotoEstimateSheet } from '../../components/cards/PhotoEstimateSheet';
import { CoachCard } from '../../components/cards/CoachCard';
import { TargetsCard } from '../../components/cards/TargetsCard';
import { WeekTracker } from '../../components/cards/WeekTracker';
import { WorkoutHeroCard } from '../../components/cards/WorkoutHeroCard';
import { EmptyState, ErrorState, errorMessage, InlineNotice, LoadingSkeleton } from '../../components/feedback';
import { Appear, Card, haptic, IconButton, ListRow, Screen, ScreenHeader, SectionHeader, SegmentedControl, Text, TextLink } from '../../components/ui';
import { relativeDayLabel } from '../../features/fitness/schedule';
import { useFitness } from '../../hooks/useFitness';
import { useNutritionLog } from '../../hooks/useNutritionLog';
import { createFitnessPlan } from '../../lib/fitness';
import { formatDateTimeLabel, formatDayLabel } from '../../lib/formatDate';
import { midSentence, t } from '../../lib/i18n';

/** Fitness: “What is my next session?” */
export default function FitnessScreen() {
  const fitness = useFitness();
  const queryClient = useQueryClient();
  const { profile, plan, next, userId } = fitness;
  // Set by the questionnaire when saving caused the plan to be recalculated.
  // The tab stays mounted when you switch away: without clearing the parameter, the banner would
  // reappear on every return to Fitness, long after the recalculation.
  const { recalcule } = useLocalSearchParams<{ recalcule?: string }>();
  useEffect(() => {
    if (recalcule !== '1') return;
    // Clearing the parameter hides the banner and stops it coming back: one move for both, and
    // nothing to keep in sync in local state.
    const timer = setTimeout(() => router.setParams({ recalcule: undefined }), 12_000);
    return () => clearTimeout(timer);
  }, [recalcule]);
  const [showAllAdjustments, setShowAllAdjustments] = useState(false);
  const nutrition = useNutritionLog();
  const [foodSheet, setFoodSheet] = useState<'none' | 'manual' | 'photo'>('none');

  const generateMutation = useMutation({
    mutationFn: () => createFitnessPlan(userId!, profile!),
    onSuccess: () => {
      haptic.success();
      queryClient.invalidateQueries({ queryKey: ['fitnessPlans', userId] });
      queryClient.invalidateQueries({ queryKey: ['fitnessPlanCount', userId] });
    },
  });

  const header = (
    <>
      <ScreenHeader
        overline={t('Your coach')}
        title={t('Fitness')}
        subtitle={t('A stronger body, a calmer mind.')}
        right={
          fitness.isPremium && profile ? (
            <IconButton icon="settings-outline" label={t('My fitness profile')} onPress={() => router.push('/fitness/questionnaire')} />
          ) : undefined
        }
      />
      {plan ? (
        <View style={{ marginBottom: 18 }}>
          <SegmentedControl
            label={t('Fitness')}
            value="overview"
            onChange={(value) => {
              if (value === 'program') router.push('/fitness/program');
              if (value === 'nutrition') router.push('/fitness/nutrition');
            }}
            options={[
              { value: 'overview', label: t('Overview') },
              { value: 'program', label: t('Programme') },
              { value: 'nutrition', label: t('Nutrition') },
            ]}
          />
        </View>
      ) : null}
    </>
  );

  let body;
  if (fitness.isLoading) {
    body = <LoadingSkeleton preset="hero" />;
  } else if (!fitness.isPremium) {
    body = (
      <EmptyState
        icon="barbell-outline"
        title={t('A fitness coach of your own')}
        body={t('A strength programme built for you, meals and a shopping list matched to your calories, and a weekly check-in that adjusts all of it.')}
        actionLabel={t('See what Premium adds')}
        onAction={() => router.push('/paywall?source=locked')}
      />
    );
  } else if (fitness.isError) {
    // Without this state, a network fault would look like having no profile.
    body = <ErrorState title={t('Your fitness area could not be loaded')} onRetry={() => fitness.refetch()} retrying={fitness.isRefetching} />;
  } else if (!profile) {
    body = (
      <EmptyState
        icon="chatbubbles-outline"
        title={t('Let us get to know you')}
        body={t('A few questions about your goals, your level and your habits, and your coach builds a programme around them.')}
        actionLabel={t('Start the questionnaire')}
        onAction={() => router.push('/fitness/questionnaire')}
      />
    );
  } else if (!plan) {
    body = (
      <>
        <EmptyState
          icon="sparkles-outline"
          title={t('Your programme is waiting')}
          body={
            generateMutation.isPending
              ? t('Preparing your sessions, your meals and your shopping list…')
              : t('Sessions, meals and a shopping list, matched to your profile.')
          }
          actionLabel={t('Build my programme')}
          onAction={() => generateMutation.mutate()}
          actionLoading={generateMutation.isPending}
        />
        {generateMutation.isError ? <InlineNotice tone="error" message={errorMessage(generateMutation.error)} /> : null}
        {fitness.targets ? (
          <View style={{ marginTop: 28 }}>
            <SectionHeader title={t('Your goals')} actionLabel={t('Edit')} onAction={() => router.push('/fitness/questionnaire')} />
            <TargetsCard targets={fitness.targets} />
          </View>
        ) : null}
      </>
    );
  } else {
    const session = next ? plan.program[next.sessionIndex] : plan.program[0];
    const when = next
      ? [relativeDayLabel(next.date, fitness.today, formatDayLabel), next.startTime].filter(Boolean).join(' · ')
      : null;
    body = (
      <>
        <Appear index={1}>
          <WorkoutHeroCard
            when={when}
            session={session}
            deload={fitness.deload}
            onStart={() => router.push(`/fitness/workout/${next?.sessionIndex ?? 0}`)}
          />
        </Appear>
        {!fitness.schedule.training_slot ? (
          <Text variant="caption" tone="ink2" style={{ marginTop: 10 }}>
            {t('Set your training times in your fitness profile to see when each session falls.')}
          </Text>
        ) : null}

        {fitness.adjustments && fitness.lastCheckin ? (
          <Appear index={2}>
            <Card variant="tinted" style={{ marginTop: 16 }}>
              <Text variant="label">{t('Your programme has been adapted')}</Text>
              <Text variant="caption" tone="ink2" style={{ marginTop: 2, marginBottom: 12 }}>
                {t('After your check-in on {date}', { date: midSentence(formatDateTimeLabel(fitness.lastCheckin.created_at)) })}
              </Text>
              <AdjustmentsList adjustments={showAllAdjustments ? fitness.adjustments : fitness.adjustments.slice(0, 2)} />
              {fitness.adjustments.length > 2 ? (
                <TextLink
                  label={showAllAdjustments ? t('Show less') : t('See all {count} changes', { count: fitness.adjustments.length })}
                  icon={showAllAdjustments ? 'chevron-up' : 'chevron-down'}
                  onPress={() => setShowAllAdjustments((v) => !v)}
                />
              ) : null}
            </Card>
          </Appear>
        ) : null}

        {fitness.targets ? (
          <Appear index={3}>
            <View style={{ marginTop: 28 }}>
              <SectionHeader title={t('Your goals')} actionLabel={t('Edit')} onAction={() => router.push('/fitness/questionnaire')} />
              <TargetsCard targets={fitness.targets} />
            </View>
          </Appear>
        ) : null}

        {fitness.targets ? (
          <Appear index={4}>
            <View style={{ marginTop: 16 }}>
              <CalorieProgressCard log={nutrition} onAdd={() => setFoodSheet('manual')} />
            </View>
          </Appear>
        ) : null}

        {plan.coach_notes ? (
          <Appear index={5}>
            <View style={{ marginTop: 16 }}>
              <CoachCard message={plan.coach_notes} />
            </View>
          </Appear>
        ) : null}

        <Appear index={6}>
          <View style={{ marginTop: 28 }}>
            <SectionHeader title={t('Your sessions this week')} />
            <WeekTracker days={fitness.tracker} />
          </View>
        </Appear>

        <Appear index={7}>
          <View style={{ marginTop: 20 }}>
            <ListRow
              icon="clipboard-outline"
              title={t('Do my weekly check-in')}
              subtitle={
                fitness.lastCheckin
                  ? t('Last check-in: {date}', { date: midSentence(formatDateTimeLabel(fitness.lastCheckin.created_at)) })
                  : t('Your coach then adjusts your programme')
              }
              onPress={() => router.push('/fitness/checkin')}
              divider
            />
            <ListRow
              icon="chatbubbles-outline"
              title={t('Ask my coach a question')}
              subtitle={t('Sessions, meals, recovery')}
              onPress={() => router.push('/coach?sujet=forme')}
            />
          </View>
        </Appear>
      </>
    );
  }

  return (
    <Screen inTabs refreshing={fitness.isRefetching} onRefresh={
        fitness.isPremium
          ? () => {
              fitness.refetch();
              nutrition.refetch();
            }
          : undefined
      }>
      {header}
      {recalcule === '1' ? (
        <InlineNotice
          tone="success"
          message={t('Your programme, your meals and your shopping list have been recalculated from your new profile.')}
        />
      ) : null}
      {body}
      <AddFoodSheet
        log={nutrition}
        visible={foodSheet === 'manual'}
        onClose={() => setFoodSheet('none')}
        onScan={() => setFoodSheet('photo')}
      />
      <PhotoEstimateSheet log={nutrition} visible={foodSheet === 'photo'} onClose={() => setFoodSheet('none')} />
      <Text variant="caption" tone="ink3" style={{ marginTop: 28 }}>
        {t('Regain is not a substitute for a doctor or a dietitian. If you have a health condition, an injury or are pregnant, speak to a professional before you start.')}
      </Text>
    </Screen>
  );
}
