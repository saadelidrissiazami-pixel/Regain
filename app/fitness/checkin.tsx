import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { AdjustmentsList } from '../../src/components/AdjustmentsList';
import { Appear, haptic, PressableScale } from '../../src/components/motion';
import { Segmented } from '../../src/components/Segmented';
import { Select } from '../../src/components/Select';
import { Text, TextInput } from '../../src/components/typography';
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
        throw new Error('Indiquez vos séances faites et votre niveau d’énergie.');
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
      const previous = queryClient.getQueryData<FitnessPlan | null>(['fitnessPlan', userId]) ?? (await fetchLatestFitnessPlan(userId));
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
    onSuccess: ({ plan }) => {
      haptic.success();
      queryClient.setQueryData(['fitnessPlan', userId], plan);
      queryClient.invalidateQueries({ queryKey: ['fitnessProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['fitnessCheckins', userId] });
      queryClient.invalidateQueries({ queryKey: ['fitnessPlans', userId] });
    },
  });

  const result = submitMutation.data;

  const plannedSessions = profile?.days_per_week ?? 3;

  // Après l'envoi : ce que le bilan a changé, avant de revenir au programme.
  if (result) {
    return (
      <ScrollView className="flex-1 bg-paper px-6 pt-16" contentContainerStyle={{ paddingBottom: 60 }}>
        <Appear>
          <Text className="mb-3 text-4xl">✅</Text>
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-1 text-[28px] leading-8 text-ink">
            Bilan pris en compte
          </Text>
          <Text className="mb-5 text-sm text-ink-soft">
            Votre programme de la semaine, vos menus et votre liste de courses viennent d'être ajustés.
          </Text>
        </Appear>

        <View className="mb-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <AdjustmentsList adjustments={result.adjustments} />
        </View>

        {result.plan.coach_notes ? (
          <Appear index={1}>
            <View className="mb-5 rounded-2xl bg-calm-soft p-4">
              <Text style={{ fontFamily: 'Figtree_700Bold' }} className="mb-1 text-xs text-calm">
                Le mot de votre coach
              </Text>
              <Text className="text-sm leading-5 text-ink">{result.plan.coach_notes}</Text>
            </View>
          </Appear>
        ) : null}

        <PressableScale
          onPress={() => router.back()}
          feedback="medium"
          className="items-center rounded-full bg-ink px-5 py-4"
        >
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-center text-base text-paper">
            Voir mon programme
          </Text>
        </PressableScale>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-paper px-6 pt-16" contentContainerStyle={{ paddingBottom: 60 }}>
      <Pressable onPress={() => router.back()} className="mb-5">
        <Text style={{ fontFamily: 'Figtree_700Bold' }} className="text-sm text-ink-soft">
          ← Retour
        </Text>
      </Pressable>
      <Text style={{ fontFamily: 'Figtree_700Bold' }} className="mb-1 text-sm text-primary">
        Coach forme
      </Text>
      <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-2 text-[28px] leading-8 text-ink">
        Bilan de la semaine
      </Text>
      <Text className="mb-5 text-sm text-ink-soft">
        Quelques réponses honnêtes, et votre coach ajuste le programme de la semaine qui vient. Rien n&apos;est un
        échec : une semaine chargée, ça arrive.
      </Text>

      {profileQuery.isLoading ? <ActivityIndicator className="text-primary" /> : null}

      <Segmented
        label="Séances faites"
        value={sessionsDone ?? -1}
        onChange={setSessionsDone}
        options={Array.from({ length: plannedSessions + 1 }, (_, n) => ({ value: n, label: String(n) }))}
      />
      <Text className="mb-4 text-xs text-ink-soft">Sur {plannedSessions} prévues. Zéro aussi est une réponse.</Text>

      <Select
        label="Votre énergie cette semaine"
        title="Comment avez-vous tenu ?"
        placeholder="Choisir"
        value={energy}
        options={ENERGY_LEVELS}
        onChange={setEnergy}
      />

      <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        Poids actuel (optionnel)
      </Text>
      <TextInput
        className="mb-4 rounded-2xl border border-line bg-surface px-4 py-3.5 text-ink"
        placeholder={profile ? `Dernier poids : ${profile.weight_kg} kg` : 'Poids (kg)'}

        keyboardType="decimal-pad"
        value={weightText}
        onChangeText={setWeightText}
      />

      <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        Un mot pour votre coach (optionnel)
      </Text>
      <TextInput
        className="mb-5 min-h-[90px] rounded-2xl border border-line bg-surface p-4 text-ink"
        style={{ textAlignVertical: 'top' }}
        multiline
        placeholder="Ce qui a été facile, difficile, une douleur, une envie…"

        value={note}
        onChangeText={setNote}
      />

      {submitMutation.isError ? (
        <Text className="mb-3 text-xs text-red-700">{(submitMutation.error as Error).message}</Text>
      ) : null}

      {submitMutation.isPending ? (
        <View className="flex-row items-center rounded-2xl bg-surface p-4">
          <ActivityIndicator className="text-primary" />
          <Text className="ml-3 flex-1 text-sm text-ink-soft">
            Ajustement de votre programme…
          </Text>
        </View>
      ) : (
        <PressableScale
          onPress={() => submitMutation.mutate()}
          disabled={!profile}
          feedback="medium"
          className="items-center rounded-full bg-ink px-5 py-4"
        >
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-center text-base text-paper">
            Envoyer mon bilan
          </Text>
        </PressableScale>
      )}
    </ScrollView>
  );
}
