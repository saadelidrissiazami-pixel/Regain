import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AdjustmentsList } from '../../components/AdjustmentsList';
import { CoachCard } from '../../components/cards/CoachCard';
import { TargetsCard } from '../../components/cards/TargetsCard';
import { WeekTracker } from '../../components/cards/WeekTracker';
import { WorkoutHeroCard } from '../../components/cards/WorkoutHeroCard';
import { EmptyState, ErrorState, errorMessage, InlineNotice, LoadingSkeleton } from '../../components/feedback';
import { Appear, Card, haptic, IconButton, ListRow, Screen, ScreenHeader, SectionHeader, SegmentedControl, Text, TextLink } from '../../components/ui';
import { relativeDayLabel } from '../../features/fitness/schedule';
import { useFitness } from '../../hooks/useFitness';
import { createFitnessPlan } from '../../lib/fitness';
import { formatDateTimeLabel, formatDayLabel } from '../../lib/formatDate';

/** Forme : « Quelle est ma prochaine séance ? » */
export default function FitnessScreen() {
  const fitness = useFitness();
  const queryClient = useQueryClient();
  const { profile, plan, next, userId } = fitness;
  // Posé par le questionnaire quand l'enregistrement a entraîné un recalcul du plan.
  // L'onglet reste monté quand on en change : sans effacer le paramètre, le bandeau
  // réapparaîtrait à chaque retour sur Forme, longtemps après le recalcul.
  const { recalcule } = useLocalSearchParams<{ recalcule?: string }>();
  useEffect(() => {
    if (recalcule !== '1') return;
    // Effacer le paramètre masque le bandeau et l'empêche de revenir : un seul geste pour les
    // deux, et rien à synchroniser dans un état local.
    const timer = setTimeout(() => router.setParams({ recalcule: undefined }), 12_000);
    return () => clearTimeout(timer);
  }, [recalcule]);
  const [showAllAdjustments, setShowAllAdjustments] = useState(false);

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
        overline="Ton coach"
        title="Forme"
        subtitle="A stronger body, a calmer mind."
        right={
          fitness.isPremium && profile ? (
            <IconButton icon="settings-outline" label="Mon profil forme" onPress={() => router.push('/fitness/questionnaire')} />
          ) : undefined
        }
      />
      {plan ? (
        <View style={{ marginBottom: 18 }}>
          <SegmentedControl
            label="Forme"
            value="overview"
            onChange={(value) => {
              if (value === 'program') router.push('/fitness/program');
            }}
            options={[
              { value: 'overview', label: 'Overview' },
              { value: 'program', label: 'Programme' },
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
        title="A fitness coach of your own"
        body="A strength programme built for you, meals and a shopping list matched to your calories, and a weekly check-in that adjusts all of it."
        actionLabel="See what Premium adds"
        onAction={() => router.push('/paywall?source=locked')}
      />
    );
  } else if (fitness.isError) {
    // Sans cet état, une panne réseau ferait croire qu'il n'y a pas de profil.
    body = <ErrorState title="Ton espace forme n'a pas pu se charger" onRetry={() => fitness.refetch()} retrying={fitness.isRefetching} />;
  } else if (!profile) {
    body = (
      <EmptyState
        icon="chatbubbles-outline"
        title="Faisons connaissance"
        body="A few questions about your goals, your level and your habits, and your coach builds a programme around them."
        actionLabel="Start the questionnaire"
        onAction={() => router.push('/fitness/questionnaire')}
      />
    );
  } else if (!plan) {
    body = (
      <>
        <EmptyState
          icon="sparkles-outline"
          title="Ton programme t'attend"
          body={
            generateMutation.isPending
              ? 'Preparing your sessions, your meals and your shopping list…'
              : 'Sessions, meals and a shopping list, matched to your profile.'
          }
          actionLabel="Build my programme"
          onAction={() => generateMutation.mutate()}
          actionLoading={generateMutation.isPending}
        />
        {generateMutation.isError ? <InlineNotice tone="error" message={errorMessage(generateMutation.error)} /> : null}
        {fitness.targets ? (
          <View style={{ marginTop: 28 }}>
            <SectionHeader title="Your goals" actionLabel="Edit" onAction={() => router.push('/fitness/questionnaire')} />
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
            Set your training times in your fitness profile to see when each session falls.
          </Text>
        ) : null}

        {fitness.adjustments && fitness.lastCheckin ? (
          <Appear index={2}>
            <Card variant="tinted" style={{ marginTop: 16 }}>
              <Text variant="label">Your programme has been adapted</Text>
              <Text variant="caption" tone="ink2" style={{ marginTop: 2, marginBottom: 12 }}>
                After your check-in on {formatDateTimeLabel(fitness.lastCheckin.created_at)}
              </Text>
              <AdjustmentsList adjustments={showAllAdjustments ? fitness.adjustments : fitness.adjustments.slice(0, 2)} />
              {fitness.adjustments.length > 2 ? (
                <TextLink
                  label={showAllAdjustments ? 'Show less' : `See all ${fitness.adjustments.length} changes`}
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
              <SectionHeader title="Your goals" actionLabel="Edit" onAction={() => router.push('/fitness/questionnaire')} />
              <TargetsCard targets={fitness.targets} />
            </View>
          </Appear>
        ) : null}

        {plan.coach_notes ? (
          <Appear index={4}>
            <View style={{ marginTop: 16 }}>
              <CoachCard message={plan.coach_notes} />
            </View>
          </Appear>
        ) : null}

        <Appear index={5}>
          <View style={{ marginTop: 28 }}>
            <SectionHeader title="Your sessions this week" actionLabel="See all" onAction={() => router.push('/fitness/program')} />
            <WeekTracker days={fitness.tracker} />
          </View>
        </Appear>

        <Appear index={6}>
          <View style={{ marginTop: 20 }}>
            <ListRow
              icon="restaurant-outline"
              title="Nutrition this week"
              subtitle={`${plan.meals.length} sample days and your shopping list`}
              onPress={() => router.push('/fitness/nutrition')}
              divider
            />
            <ListRow
              icon="clipboard-outline"
              title="Do my weekly check-in"
              subtitle={
                fitness.lastCheckin
                  ? `Dernier bilan : ${formatDateTimeLabel(fitness.lastCheckin.created_at).toLowerCase()}`
                  : 'Your coach then adjusts your programme'
              }
              onPress={() => router.push('/fitness/checkin')}
              divider
            />
            <ListRow
              icon="chatbubbles-outline"
              title="Ask my coach a question"
              subtitle="Sessions, meals, recovery"
              onPress={() => router.push('/coach?sujet=forme')}
            />
          </View>
        </Appear>
      </>
    );
  }

  return (
    <Screen inTabs refreshing={fitness.isRefetching} onRefresh={fitness.isPremium ? () => fitness.refetch() : undefined}>
      {header}
      {recalcule === '1' ? (
        <InlineNotice
          tone="success"
          message="Your programme, your meals and your shopping list have been recalculated from your new profile."
        />
      ) : null}
      {body}
      <Text variant="caption" tone="ink3" style={{ marginTop: 28 }}>
        Regain is not a substitute for a doctor or a dietitian. If you have a health condition, an
        injury or are pregnant, speak to a professional before you start.
      </Text>
    </Screen>
  );
}
