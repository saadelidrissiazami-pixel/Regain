import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
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
  const { recalcule } = useLocalSearchParams<{ recalcule?: string }>();
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
        subtitle="Un corps plus fort, un esprit plus serein."
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
              { value: 'overview', label: 'Aperçu' },
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
        title="Un coach forme rien que pour toi"
        body="Programme de musculation personnalisé, menus et liste de courses calés sur tes calories, et un bilan chaque semaine pour tout ajuster."
        actionLabel="Découvrir Premium"
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
        body="Quelques questions sur tes objectifs, ton niveau et tes habitudes, et ton coach te prépare un programme sur mesure."
        actionLabel="Commencer le questionnaire"
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
              ? 'Préparation de tes séances, de tes menus et de ta liste de courses…'
              : 'Séances, menus et liste de courses, calés sur ton profil.'
          }
          actionLabel="Générer mon programme"
          onAction={() => generateMutation.mutate()}
          actionLoading={generateMutation.isPending}
        />
        {generateMutation.isError ? <InlineNotice tone="error" message={errorMessage(generateMutation.error)} /> : null}
        {fitness.targets ? (
          <View style={{ marginTop: 28 }}>
            <SectionHeader title="Tes objectifs" actionLabel="Modifier" onAction={() => router.push('/fitness/questionnaire')} />
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
            Indique quand tu t'entraînes dans ton profil forme pour voir l'heure de tes séances.
          </Text>
        ) : null}

        {fitness.adjustments && fitness.lastCheckin ? (
          <Appear index={2}>
            <Card variant="tinted" style={{ marginTop: 16 }}>
              <Text variant="label">Ton programme a été adapté</Text>
              <Text variant="caption" tone="ink2" style={{ marginTop: 2, marginBottom: 12 }}>
                Après ton bilan du {formatDateTimeLabel(fitness.lastCheckin.created_at).toLowerCase()}
              </Text>
              <AdjustmentsList adjustments={showAllAdjustments ? fitness.adjustments : fitness.adjustments.slice(0, 2)} />
              {fitness.adjustments.length > 2 ? (
                <TextLink
                  label={showAllAdjustments ? 'Voir moins' : `Voir les ${fitness.adjustments.length} changements`}
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
              <SectionHeader title="Tes objectifs" actionLabel="Modifier" onAction={() => router.push('/fitness/questionnaire')} />
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
            <SectionHeader title="Tes séances de la semaine" actionLabel="Voir tout" onAction={() => router.push('/fitness/program')} />
            <WeekTracker days={fitness.tracker} />
          </View>
        </Appear>

        <Appear index={6}>
          <View style={{ marginTop: 20 }}>
            <ListRow
              icon="restaurant-outline"
              title="Nutrition de la semaine"
              subtitle={`${plan.meals.length} journées types et ta liste de courses`}
              onPress={() => router.push('/fitness/nutrition')}
              divider
            />
            <ListRow
              icon="clipboard-outline"
              title="Faire mon bilan de la semaine"
              subtitle={
                fitness.lastCheckin
                  ? `Dernier bilan : ${formatDateTimeLabel(fitness.lastCheckin.created_at).toLowerCase()}`
                  : 'Ton coach ajuste ensuite ton programme'
              }
              onPress={() => router.push('/fitness/checkin')}
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
          message="Ton programme, tes menus et ta liste de courses ont été recalculés à partir de ton nouveau profil."
        />
      ) : null}
      {body}
      <Text variant="caption" tone="ink3" style={{ marginTop: 28 }}>
        Regain ne remplace pas l&apos;avis d&apos;un médecin ou d&apos;un diététicien. En cas de problème de santé, de blessure ou
        de grossesse, demande conseil à un professionnel avant de commencer.
      </Text>
    </Screen>
  );
}
