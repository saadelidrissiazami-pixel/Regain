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

const ENERGY_LEVELS = [
  { value: 1, label: 'Épuisé·e', hint: 'Rien dans le réservoir' },
  { value: 2, label: 'Fatigué·e', hint: 'Les séances ont été dures' },
  { value: 3, label: 'Correct', hint: 'Ni plus ni moins que d’habitude' },
  { value: 4, label: 'En forme', hint: 'Bonne semaine' },
  { value: 5, label: 'Au top', hint: 'Prêt·e à en faire plus' },
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
      if (!userId || !profile) throw new Error('Profil forme introuvable.');
      if (sessionsDone === null || energy === null) {
        throw new Error('Indique tes séances faites et ton niveau d’énergie.');
      }
      const weight = weightText.trim() ? Number(weightText.trim().replace(',', '.')) : null;
      if (weight !== null && (!Number.isFinite(weight) || weight < 35 || weight > 250)) {
        throw new Error('Poids : entre 35 et 250 kg.');
      }

      await createCheckin(userId, {
        weight_kg: weight,
        sessions_done: sessionsDone,
        energy,
        note: note.trim() || null,
      });
      if (weight !== null) await updateFitnessWeight(userId, weight);

      // Nouveau programme : cibles recalculées avec le poids du jour, volume ajusté selon le bilan.
      // La clé est celle qu'alimente useFitness (les deux plans les plus récents) : une clé au
      // singulier, lue ici auparavant, n'était jamais remplie et forçait un aller-retour réseau.
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

  // Après l'envoi : ce que le bilan a changé, avant de revenir au programme.
  if (result) {
    return (
      <Screen footer={<Button label="Voir mon programme" onPress={() => goBack('/(tabs)/fitness')} />}>
        <Appear>
          <ScreenHeader title="Bilan pris en compte" subtitle="Ton programme, tes menus et ta liste de courses viennent d'être adaptés." />
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
            label={submitMutation.isPending ? 'Ajustement de ton programme…' : 'Envoyer mon bilan'}
            loading={submitMutation.isPending}
            disabled={!profile}
            onPress={() => submitMutation.mutate()}
            style={{ marginTop: submitMutation.isError ? 10 : 0 }}
          />
        </View>
      }
    >
      <ScreenHeader
        overline="Ton coach forme"
        title="Bilan de la semaine"
        subtitle="Quelques réponses honnêtes, et ton coach ajuste la semaine qui vient. Une semaine chargée, ça arrive."
        onBack={() => goBack('/(tabs)/fitness')}
      />

      {profileQuery.isLoading ? <LoadingSkeleton preset="list" /> : null}

      <Text variant="label" style={{ marginBottom: 8 }}>
        Séances faites
      </Text>
      <SegmentedControl
        label="Séances faites"
        tone="surface"
        value={sessionsDone ?? -1}
        onChange={setSessionsDone}
        options={Array.from({ length: plannedSessions + 1 }, (_, n) => ({ value: n, label: String(n) }))}
      />
      <Text variant="caption" tone="ink2" style={{ marginTop: 6, marginBottom: 20 }}>
        Sur {plannedSessions} prévues. Zéro aussi est une réponse.
      </Text>

      <Select
        label="Ton énergie cette semaine"
        title="Comment as-tu tenu ?"
        placeholder="Choisir"
        value={energy}
        options={ENERGY_LEVELS}
        onChange={setEnergy}
      />

      <Field
        label="Poids actuel (facultatif)"
        placeholder={profile ? `Dernier poids : ${profile.weight_kg} kg` : 'Poids (kg)'}
        keyboardType="decimal-pad"
        value={weightText}
        onChangeText={setWeightText}
      />

      <Field
        label="Un mot pour ton coach (facultatif)"
        multiline
        placeholder="Ce qui a été facile, difficile, une douleur, une envie…"
        value={note}
        onChangeText={setNote}
      />
    </Screen>
  );
}
