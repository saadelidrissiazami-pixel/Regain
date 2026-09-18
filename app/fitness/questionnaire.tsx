import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Segmented } from '../../src/components/Segmented';
import { Select, SelectMulti } from '../../src/components/Select';
import { PressableScale } from '../../src/components/motion';
import { Text, TextInput } from '../../src/components/typography';
import {
  ACTIVITY_LEVELS,
  DIET_OPTIONS,
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
  FITNESS_GOALS,
  SEX_OPTIONS,
} from '../../src/features/fitness/options';
import {
  fitnessQuestionnaireSchema,
  profileToQuestionnaire,
  questionnaireToProfile,
  type FitnessQuestionnaireValues,
} from '../../src/features/fitness/schema';
import type { FitnessProfile } from '../../src/features/fitness/types';
import { fetchFitnessProfile, saveFitnessProfile } from '../../src/lib/fitness';
import { useAuthStore } from '../../src/store/authStore';

const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6].map((days) => ({
  value: days,
  label: `${days} séance${days > 1 ? 's' : ''} par semaine`,
}));
const SESSION_MINUTES_OPTIONS = [30, 45, 60, 75, 90].map((minutes) => ({
  value: minutes,
  label: `${minutes} minutes`,
  hint: minutes <= 30 ? 'Séances courtes et efficaces' : minutes >= 75 ? 'Séances longues, échauffement compris' : undefined,
}));

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="mb-2.5 mt-5 text-sm text-ink">
      {children}
    </Text>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <Text className="-mt-1 mb-2 text-xs text-red-700">{message}</Text> : null;
}

const inputClass = 'mb-2 rounded-2xl border border-line bg-surface px-4 py-3.5 text-ink';

function QuestionnaireForm({ userId, initialProfile }: { userId: string; initialProfile: FitnessProfile | null }) {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FitnessQuestionnaireValues>({
    resolver: zodResolver(fitnessQuestionnaireSchema),
    defaultValues: profileToQuestionnaire(initialProfile),
  });

  const saveMutation = useMutation({
    mutationFn: (values: FitnessQuestionnaireValues) => saveFitnessProfile(userId, questionnaireToProfile(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['fitnessProfile', userId] });
      router.back();
    },
  });

  return (
    <>
      <SectionTitle>Vos objectifs</SectionTitle>
      <Controller
        control={control}
        name="goals"
        render={({ field: { value, onChange } }) => (
          <SelectMulti
            label="Objectifs"
            title="Que cherchez-vous ?"
            placeholder="Choisir un ou plusieurs objectifs"
            values={value}
            options={[...FITNESS_GOALS]}
            onChange={onChange}
          />
        )}
      />
      <FieldError message={errors.goals?.message} />

      <SectionTitle>Vous</SectionTitle>
      <Text className="mb-2 text-xs text-ink-soft">
        Sexe, âge, taille et poids servent uniquement au calcul de vos besoins caloriques.
      </Text>
      <Controller
        control={control}
        name="sex"
        render={({ field: { value, onChange } }) => (
          <Segmented label="Sexe" value={value} onChange={onChange} options={[...SEX_OPTIONS]} />
        )}
      />
      <Controller
        control={control}
        name="birthYear"
        render={({ field: { value, onChange } }) => (
          <TextInput
            className={inputClass}
            placeholder="Année de naissance (ex. 1990)"

            keyboardType="number-pad"
            maxLength={4}
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      <FieldError message={errors.birthYear?.message} />
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Controller
            control={control}
            name="heightCm"
            render={({ field: { value, onChange } }) => (
              <TextInput
                className={inputClass}
                placeholder="Taille (cm)"

                keyboardType="number-pad"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>
        <View className="flex-1">
          <Controller
            control={control}
            name="weightKg"
            render={({ field: { value, onChange } }) => (
              <TextInput
                className={inputClass}
                placeholder="Poids (kg)"

                keyboardType="decimal-pad"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>
      </View>
      <FieldError message={errors.heightCm?.message ?? errors.weightKg?.message} />

      <SectionTitle>Votre activité au quotidien</SectionTitle>
      <Controller
        control={control}
        name="activityLevel"
        render={({ field: { value, onChange } }) => (
          <Select
            label="Niveau d'activité"
            title="Votre activité au quotidien"
            value={value}
            options={[...ACTIVITY_LEVELS]}
            onChange={onChange}
          />
        )}
      />

      <SectionTitle>Votre niveau en musculation</SectionTitle>
      <Controller
        control={control}
        name="experience"
        render={({ field: { value, onChange } }) => (
          <Segmented label="Niveau" value={value} onChange={onChange} options={[...EXPERIENCE_LEVELS]} />
        )}
      />

      <SectionTitle>Votre matériel</SectionTitle>
      <Controller
        control={control}
        name="equipment"
        render={({ field: { value, onChange } }) => (
          <Select
            label="Matériel"
            title="Avec quoi vous entraînez-vous ?"
            value={value}
            options={[...EQUIPMENT_OPTIONS]}
            onChange={onChange}
          />
        )}
      />

      <SectionTitle>Séances par semaine</SectionTitle>
      <Controller
        control={control}
        name="daysPerWeek"
        render={({ field: { value, onChange } }) => (
          <Select
            label="Séances par semaine"
            title="Combien de séances par semaine ?"
            value={value}
            options={DAYS_OPTIONS}
            onChange={onChange}
          />
        )}
      />

      <SectionTitle>Durée d&apos;une séance</SectionTitle>
      <Controller
        control={control}
        name="sessionMinutes"
        render={({ field: { value, onChange } }) => (
          <Select
            label="Durée d'une séance"
            title="Combien de temps par séance ?"
            value={value}
            options={SESSION_MINUTES_OPTIONS}
            onChange={onChange}
          />
        )}
      />

      <SectionTitle>Votre alimentation</SectionTitle>
      <Controller
        control={control}
        name="diet"
        render={({ field: { value, onChange } }) => (
          <Select
            label="Régime alimentaire"
            title="Votre alimentation"
            value={value}
            options={[...DIET_OPTIONS]}
            onChange={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="allergies"
        render={({ field: { value, onChange } }) => (
          <TextInput
            className={inputClass}
            placeholder="Allergies ou intolérances (optionnel)"

            value={value}
            onChangeText={onChange}
          />
        )}
      />
      <FieldError message={errors.allergies?.message} />

      <SectionTitle>Santé</SectionTitle>
      <Controller
        control={control}
        name="healthNotes"
        render={({ field: { value, onChange } }) => (
          <TextInput
            className={`${inputClass} min-h-[90px]`}
            style={{ textAlignVertical: 'top' }}
            multiline
            placeholder="Blessure, douleur, traitement, grossesse… (optionnel, pour que votre coach adapte le programme)"

            value={value}
            onChangeText={onChange}
          />
        )}
      />
      <FieldError message={errors.healthNotes?.message} />
      <Text className="mb-5 text-xs text-ink-soft">
        Votre coach n&apos;est pas un professionnel de santé : en cas de problème médical, demandez l&apos;avis de
        votre médecin avant de commencer.
      </Text>

      {saveMutation.isError ? (
        <Text className="mb-3 text-xs text-red-700">{(saveMutation.error as Error).message}</Text>
      ) : null}

      <PressableScale
        onPress={handleSubmit((values) => saveMutation.mutate(values))}
        disabled={saveMutation.isPending}
        feedback="medium"
        className="items-center rounded-full bg-ink px-5 py-4"
      >
        {saveMutation.isPending ? (
          <ActivityIndicator className="text-paper" />
        ) : (
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-center text-base text-paper">
            Enregistrer
          </Text>
        )}
      </PressableScale>
    </>
  );
}

export default function FitnessQuestionnaireScreen() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;

  const profileQuery = useQuery({
    queryKey: ['fitnessProfile', userId],
    queryFn: () => fetchFitnessProfile(userId!),
    enabled: !!userId,
  });

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
      <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className="text-[28px] leading-8 text-ink">
        Votre profil
      </Text>

      {!userId || profileQuery.isLoading ? (
        <ActivityIndicator className="mt-6 text-primary" />
      ) : (
        <QuestionnaireForm userId={userId} initialProfile={profileQuery.data ?? null} />
      )}
    </ScrollView>
  );
}
