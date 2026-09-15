import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Chip } from '../../src/components/Chip';
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

const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6];
const SESSION_MINUTES_OPTIONS = [30, 45, 60, 75, 90];

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 mt-5 text-sm text-ink">
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
          <View className="mb-1 flex-row flex-wrap">
            {FITNESS_GOALS.map((goal) => (
              <Chip
                key={goal.value}
                label={goal.label}
                selected={value.includes(goal.value)}
                onPress={() =>
                  onChange(value.includes(goal.value) ? value.filter((g) => g !== goal.value) : [...value, goal.value])
                }
              />
            ))}
          </View>
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
          <View className="mb-2 flex-row flex-wrap">
            {SEX_OPTIONS.map((opt) => (
              <Chip key={opt.value} label={opt.label} selected={value === opt.value} onPress={() => onChange(opt.value)} />
            ))}
          </View>
        )}
      />
      <Controller
        control={control}
        name="birthYear"
        render={({ field: { value, onChange } }) => (
          <TextInput
            className={inputClass}
            placeholder="Année de naissance (ex. 1990)"
            placeholderTextColor="#B5AB9A"
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
                placeholderTextColor="#B5AB9A"
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
                placeholderTextColor="#B5AB9A"
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
          <View>
            {ACTIVITY_LEVELS.map((level) => (
              <Pressable
                key={level.value}
                onPress={() => onChange(level.value)}
                className={`mb-2 rounded-2xl border p-3.5 ${value === level.value ? 'border-primary bg-primary-soft' : 'border-line bg-surface'}`}
              >
                <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
                  {level.label}
                </Text>
                <Text className="text-xs text-ink-soft">{level.hint}</Text>
              </Pressable>
            ))}
          </View>
        )}
      />

      <SectionTitle>Votre niveau en musculation</SectionTitle>
      <Controller
        control={control}
        name="experience"
        render={({ field: { value, onChange } }) => (
          <View className="flex-row flex-wrap">
            {EXPERIENCE_LEVELS.map((opt) => (
              <Chip key={opt.value} label={opt.label} selected={value === opt.value} onPress={() => onChange(opt.value)} />
            ))}
          </View>
        )}
      />

      <SectionTitle>Votre matériel</SectionTitle>
      <Controller
        control={control}
        name="equipment"
        render={({ field: { value, onChange } }) => (
          <View className="flex-row flex-wrap">
            {EQUIPMENT_OPTIONS.map((opt) => (
              <Chip key={opt.value} label={opt.label} selected={value === opt.value} onPress={() => onChange(opt.value)} />
            ))}
          </View>
        )}
      />

      <SectionTitle>Séances par semaine</SectionTitle>
      <Controller
        control={control}
        name="daysPerWeek"
        render={({ field: { value, onChange } }) => (
          <View className="flex-row flex-wrap">
            {DAYS_OPTIONS.map((days) => (
              <Chip key={days} label={String(days)} selected={value === days} onPress={() => onChange(days)} />
            ))}
          </View>
        )}
      />

      <SectionTitle>Durée d&apos;une séance</SectionTitle>
      <Controller
        control={control}
        name="sessionMinutes"
        render={({ field: { value, onChange } }) => (
          <View className="flex-row flex-wrap">
            {SESSION_MINUTES_OPTIONS.map((minutes) => (
              <Chip key={minutes} label={`${minutes} min`} selected={value === minutes} onPress={() => onChange(minutes)} />
            ))}
          </View>
        )}
      />

      <SectionTitle>Votre alimentation</SectionTitle>
      <Controller
        control={control}
        name="diet"
        render={({ field: { value, onChange } }) => (
          <View className="mb-2 flex-row flex-wrap">
            {DIET_OPTIONS.map((opt) => (
              <Chip key={opt.value} label={opt.label} selected={value === opt.value} onPress={() => onChange(opt.value)} />
            ))}
          </View>
        )}
      />
      <Controller
        control={control}
        name="allergies"
        render={({ field: { value, onChange } }) => (
          <TextInput
            className={inputClass}
            placeholder="Allergies ou intolérances (optionnel)"
            placeholderTextColor="#B5AB9A"
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
            placeholderTextColor="#B5AB9A"
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

      <Pressable
        onPress={handleSubmit((values) => saveMutation.mutate(values))}
        disabled={saveMutation.isPending}
        className="overflow-hidden rounded-full shadow-sm"
      >
        <LinearGradient colors={['#F0A324', '#FF6B57']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 15 }}>
          {saveMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-center text-white">
              Enregistrer
            </Text>
          )}
        </LinearGradient>
      </Pressable>
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
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink-soft">
          ← Retour
        </Text>
      </Pressable>
      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1 text-sm text-primary">
        Coach forme
      </Text>
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-[28px] leading-8 text-ink">
        Votre profil
      </Text>

      {!userId || profileQuery.isLoading ? (
        <ActivityIndicator className="mt-6" color="#FF6B57" />
      ) : (
        <QuestionnaireForm userId={userId} initialProfile={profileQuery.data ?? null} />
      )}
    </ScrollView>
  );
}
