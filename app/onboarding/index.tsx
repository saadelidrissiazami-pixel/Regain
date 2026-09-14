import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Chip } from '../../src/components/Chip';
import { completeOnboarding } from '../../src/lib/profile';
import { useAuthStore } from '../../src/store/authStore';
import { BUDGET_OPTIONS, ENERGY_LEVELS, ENERGY_SLOTS, GOAL_OPTIONS } from '../../src/features/onboarding/options';
import { onboardingSchema, type OnboardingFormValues } from '../../src/features/onboarding/schema';

export default function OnboardingScreen() {
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, watch, setValue } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      primaryGoals: [],
      budgetLevel: 'modere',
      energyBySlot: { matin: 'moyen', apres_midi: 'moyen', soir: 'moyen' },
    },
  });

  const selectedGoals = watch('primaryGoals');

  const mutation = useMutation({
    mutationFn: (values: OnboardingFormValues) => {
      if (!session?.user.id) throw new Error('Session introuvable');
      return completeOnboarding(session.user.id, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile', session?.user.id] });
      router.replace('/(tabs)/planning');
    },
    onError: (e: Error) => setServerError(e.message),
  });

  const toggleGoal = (value: string) => {
    const current = selectedGoals ?? [];
    setValue('primaryGoals', current.includes(value) ? current.filter((g) => g !== value) : [...current, value]);
  };

  return (
    <ScrollView className="flex-1 bg-paper px-6 pt-16" contentContainerStyle={{ paddingBottom: 60 }}>
      <Text className="font-label mb-1 text-sm text-primary">
        Bienvenue sur Regain 🌱
      </Text>
      <Text className="font-display mb-7 text-[28px] leading-8 text-ink">
        Parlons de vous
      </Text>

      <Text className="font-display mb-2.5 text-sm text-ink">
        Quels sont vos objectifs ?
      </Text>
      <View className="mb-7 flex-row flex-wrap">
        {GOAL_OPTIONS.map((goal) => (
          <Chip
            key={goal.value}
            label={goal.label}
            selected={(selectedGoals ?? []).includes(goal.value)}
            onPress={() => toggleGoal(goal.value)}
          />
        ))}
      </View>

      <Text className="font-display mb-2.5 text-sm text-ink">
        Quel est votre budget pour vos activités ?
      </Text>
      <Controller
        control={control}
        name="budgetLevel"
        render={({ field: { value, onChange } }) => (
          <View className="mb-7 flex-row flex-wrap">
            {BUDGET_OPTIONS.map((opt) => (
              <Chip key={opt.value} label={opt.label} selected={value === opt.value} onPress={() => onChange(opt.value)} />
            ))}
          </View>
        )}
      />

      <Text className="font-display mb-2.5 text-sm text-ink">
        Votre énergie habituelle...
      </Text>
      {ENERGY_SLOTS.map((slot) => (
        <View key={slot.key} className="mb-4">
          <Text className="font-label mb-2 text-xs uppercase tracking-wide text-ink-soft">
            {slot.label}
          </Text>
          <Controller
            control={control}
            name={`energyBySlot.${slot.key}` as const}
            render={({ field: { value, onChange } }) => (
              <View className="flex-row flex-wrap">
                {ENERGY_LEVELS.map((level) => (
                  <Chip key={level.value} label={level.label} selected={value === level.value} onPress={() => onChange(level.value)} />
                ))}
              </View>
            )}
          />
        </View>
      ))}

      {serverError ? <Text className="font-body mb-3 text-xs text-red-700">{serverError}</Text> : null}

      <Pressable
        onPress={handleSubmit((values) => mutation.mutate(values))}
        disabled={mutation.isPending}
        className="mt-4 overflow-hidden rounded-full shadow-sm"
      >
        <LinearGradient colors={['#F0A324', '#FF6B57']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 15 }}>
          {mutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-display text-center text-white">
              Commencer
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}
