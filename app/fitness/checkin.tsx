import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goBack } from '../../src/lib/navigation';
import { useState } from 'react';
import { View } from 'react-native';

import { AdjustmentsList } from '../../src/components/AdjustmentsList';
import { CoachCard } from '../../src/components/cards/CoachCard';
import { errorMessage, InlineNotice, LoadingSkeleton } from '../../src/components/feedback';
import { Appear, Button, Card, Field, haptic, Screen, ScreenHeader, SegmentedControl, Select, Text } from '../../src/components/ui';
import { summarizeAdjustments, type PlanAdjustment } from '../../src/features/fitness/planDiff';
import type { FitnessPlan } from '../../src/features/fitness/types';
import { createCheckin, createFitnessPlan, fetchFitnessProfile, fetchLatestFitnessPlan, updateFitnessWeight } from '../../src/lib/fitness';
import { useAuthStore } from '../../src/store/authStore';
import { locale, t } from '../../src/lib/i18n';

const ENERGY_LEVELS = [
  { value: 1, label: t('Running on empty'), hint: t('Nothing left in the tank') },
  { value: 2, label: t('Tired'), hint: t('The sessions were hard') },
  { value: 3, label: t('Okay'), hint: t('No better or worse than usual') },
  { value: 4, label: t('Good'), hint: t('A good week') },
  { value: 5, label: t('Great'), hint: t('Ready for more') },
];

export default function FitnessCheckinScreen() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const [weightText, setWeightText] = useState('');
  const [sessionsDone, setSessionsDone] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [note, setNote] = useState('');

  const profileQuery = useQuery({
    queryKey: ['fitnessProfile', userId],
    queryFn: () => fetchFitnessProfile(userId!),
    enabled: !!userId,
  });
  const profile = profileQuery.data;

  const submitMutation = useMutation({
    mutationFn: async (): Promise<{ plan: FitnessPlan; adjustments: PlanAdjustment[] }> => {
      if (!userId || !profile) throw new Error(t('Fitness profile not found.'));
      if (sessionsDone === null || energy === null) {
        throw new Error(t('Tell us how many sessions you did and how your energy was.'));
      }
      const weight = weightText.trim() ? Number(weightText.trim().replace(',', '.')) : null;
      if (weight !== null && (!Number.isFinite(weight) || weight < 35 || weight > 250)) {
        throw new Error(t('Weight: between 35 and 250 kg.'));
      }

      await createCheckin(userId, {
        weight_kg: weight,
        sessions_done: sessionsDone,
        energy,
        note: note.trim() || null,
      });
      if (weight !== null) await updateFitnessWeight(userId, weight);

      // A new programme: targets recalculated from today's weight, volume adjusted by the check-in.
      // The key is the one useFitness fills (the two most recent plans): a singular key, which
      // used to be read here, was never populated and forced a network round trip.
      const cached = queryClient.getQueryData<FitnessPlan[]>(['fitnessPlans', userId]);
      const previous = cached?.[0] ?? (await fetchLatestFitnessPlan(userId));
      const updatedProfile = weight !== null ? { ...profile, weight_kg: weight } : profile;
      const plan = await createFitnessPlan(userId, updatedProfile, { sessions_done: sessionsDone, energy });

      return {
        plan,
        adjustments: summarizeAdjustments({
          previous,
          next: plan,
          checkin: { sessions_done: sessionsDone, energy },
          daysPerWeek: profile.days_per_week,
          previousWeightKg: Number(profile.weight_kg),
          newWeightKg: weight,
        }),
      };
    },
    onSuccess: () => {
      haptic.success();
      queryClient.invalidateQueries({ queryKey: ['fitnessProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['fitnessCheckins', userId] });
      queryClient.invalidateQueries({ queryKey: ['fitnessPlans', userId] });
      queryClient.invalidateQueries({ queryKey: ['fitnessPlanCount', userId] });
    },
  });

  const result = submitMutation.data;

  const plannedSessions = profile?.days_per_week ?? 3;

  // After sending: what the check-in changed, before going back to the programme.
  if (result) {
    return (
      <Screen footer={<Button label={t('See my programme')} onPress={() => goBack('/(tabs)/fitness')} />}>
        <Appear>
          <ScreenHeader title={t('Check-in saved')} subtitle={t('Your programme, your meals and your shopping list have just been adapted.')} />
        </Appear>
        <Card>
          <AdjustmentsList adjustments={result.adjustments} />
        </Card>
        {result.plan.coach_notes ? (
          <Appear index={1}>
            <View style={{ marginTop: 16 }}>
              <CoachCard message={result.plan.coach_notes} />
            </View>
          </Appear>
        ) : null}
      </Screen>
    );
  }

  return (
    <Screen
      keyboard
      footer={
        <View>
          {submitMutation.isError ? <InlineNotice tone="error" message={errorMessage(submitMutation.error)} /> : null}
          <Button
            label={submitMutation.isPending ? t('Adjusting your programme…') : t('Send my check-in')}
            loading={submitMutation.isPending}
            disabled={!profile}
            onPress={() => submitMutation.mutate()}
            style={{ marginTop: submitMutation.isError ? 10 : 0 }}
          />
        </View>
      }
    >
      <ScreenHeader
        overline={t('Your fitness coach')}
        title={t('This week’s check-in')}
        subtitle={t('A few honest answers, and your coach adjusts the week ahead. A busy week happens.')}
        onBack={() => goBack('/(tabs)/fitness')}
      />

      {profileQuery.isLoading ? <LoadingSkeleton preset="list" /> : null}

      <Text variant="label" style={{ marginBottom: 8 }}>
        {t('Sessions done')}
      </Text>
      <SegmentedControl
        label={t('Sessions done')}
        tone="surface"
        value={sessionsDone ?? -1}
        onChange={setSessionsDone}
        options={Array.from({ length: plannedSessions + 1 }, (_, n) => ({ value: n, label: String(n) }))}
      />
      <Text variant="caption" tone="ink2" style={{ marginTop: 6, marginBottom: 20 }}>
        {t('Out of {planned} planned. Zero is an answer too.', { planned: plannedSessions })}
      </Text>

      <Select
        label={t('Your energy this week')}
        title={t('How did you hold up?')}
        placeholder={t('Choose')}
        value={energy}
        options={ENERGY_LEVELS}
        onChange={setEnergy}
      />

      <Field
        label={t('Current weight (optional)')}
        placeholder={profile ? t('Last weight: {weight} kg', { weight: profile.weight_kg.toLocaleString(locale) }) : t('Weight (kg)')}
        keyboardType="decimal-pad"
        value={weightText}
        onChangeText={setWeightText}
      />

      <Field
        label={t('A word for your coach (optional)')}
        multiline
        placeholder={t('What was easy, what was hard, an ache, something you fancy…')}
        value={note}
        onChangeText={setNote}
      />
    </Screen>
  );
}
