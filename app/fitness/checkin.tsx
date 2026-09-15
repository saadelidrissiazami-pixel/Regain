import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Chip } from '../../src/components/Chip';
import { Text, TextInput } from '../../src/components/typography';
import {
  createCheckin,
  fetchFitnessProfile,
  requestFitnessPlan,
  targetsForProfile,
  updateFitnessWeight,
} from '../../src/lib/fitness';
import { useAuthStore } from '../../src/store/authStore';

const ENERGY_LEVELS = [
  { value: 1, label: 'Épuisé·e' },
  { value: 2, label: 'Fatigué·e' },
  { value: 3, label: 'Correct' },
  { value: 4, label: 'En forme' },
  { value: 5, label: 'Au top' },
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
    mutationFn: async () => {
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

      // Les cibles sont recalculées ici avec le nouveau poids ; l'agent ajuste séances et menus.
      const updatedProfile = weight !== null ? { ...profile, weight_kg: weight } : profile;
      return requestFitnessPlan('adjust_plan', targetsForProfile(updatedProfile));
    },
    onSuccess: (plan) => {
      queryClient.setQueryData(['fitnessPlan', userId], plan);
      queryClient.invalidateQueries({ queryKey: ['fitnessProfile', userId] });
      router.back();
    },
  });

  const plannedSessions = profile?.days_per_week ?? 3;

  return (
    <ScrollView className="flex-1 bg-paper px-6 pt-16" contentContainerStyle={{ paddingBottom: 60 }}>
      <Pressable onPress={() => router.back()} className="mb-5">
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink-soft">
          ← Retour
        </Text>
      </Pressable>
      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1 text-sm text-primary">
        Coach forme
      </Text>
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2 text-[28px] leading-8 text-ink">
        Bilan de la semaine
      </Text>
      <Text className="mb-5 text-sm text-ink-soft">
        Quelques réponses honnêtes, et votre coach ajuste le programme de la semaine qui vient. Rien n&apos;est un
        échec : une semaine chargée, ça arrive.
      </Text>

      {profileQuery.isLoading ? <ActivityIndicator color="#FF6B57" /> : null}

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        Séances faites (sur {plannedSessions} prévues)
      </Text>
      <View className="mb-4 flex-row flex-wrap">
        {Array.from({ length: plannedSessions + 1 }, (_, n) => n).map((n) => (
          <Chip key={n} label={String(n)} selected={sessionsDone === n} onPress={() => setSessionsDone(n)} />
        ))}
      </View>

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        Votre énergie cette semaine
      </Text>
      <View className="mb-4 flex-row flex-wrap">
        {ENERGY_LEVELS.map((level) => (
          <Chip key={level.value} label={level.label} selected={energy === level.value} onPress={() => setEnergy(level.value)} />
        ))}
      </View>

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        Poids actuel (optionnel)
      </Text>
      <TextInput
        className="mb-4 rounded-2xl border border-line bg-surface px-4 py-3.5 text-ink"
        placeholder={profile ? `Dernier poids : ${profile.weight_kg} kg` : 'Poids (kg)'}
        placeholderTextColor="#B5AB9A"
        keyboardType="decimal-pad"
        value={weightText}
        onChangeText={setWeightText}
      />

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        Un mot pour votre coach (optionnel)
      </Text>
      <TextInput
        className="mb-5 min-h-[90px] rounded-2xl border border-line bg-surface p-4 text-ink"
        style={{ textAlignVertical: 'top' }}
        multiline
        placeholder="Ce qui a été facile, difficile, une douleur, une envie…"
        placeholderTextColor="#B5AB9A"
        value={note}
        onChangeText={setNote}
      />

      {submitMutation.isError ? (
        <Text className="mb-3 text-xs text-red-700">{(submitMutation.error as Error).message}</Text>
      ) : null}

      {submitMutation.isPending ? (
        <View className="flex-row items-center rounded-2xl bg-surface p-4">
          <ActivityIndicator color="#FF6B57" />
          <Text className="ml-3 flex-1 text-sm text-ink-soft">
            Votre coach ajuste votre programme… Cela peut prendre jusqu&apos;à une minute.
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={() => submitMutation.mutate()}
          disabled={!profile}
          className="overflow-hidden rounded-full shadow-sm"
        >
          <LinearGradient colors={['#F0A324', '#FF6B57']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 15 }}>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-center text-white">
              Envoyer mon bilan
            </Text>
          </LinearGradient>
        </Pressable>
      )}
    </ScrollView>
  );
}
