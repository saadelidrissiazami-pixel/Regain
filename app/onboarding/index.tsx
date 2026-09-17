import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Text } from '../../src/components/typography';
import { LinearGradient } from 'expo-linear-gradient';

import { Segmented } from '../../src/components/Segmented';
import { SelectMulti } from '../../src/components/Select';
import { Appear, PressableScale } from '../../src/components/motion';
import { completeOnboarding } from '../../src/lib/profile';
import { useAuthStore } from '../../src/store/authStore';
import { BUDGET_OPTIONS, ENERGY_LEVELS, ENERGY_SLOTS, GOAL_OPTIONS } from '../../src/features/onboarding/options';
import { onboardingSchema, type OnboardingFormValues } from '../../src/features/onboarding/schema';

export default function OnboardingScreen() {
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      primaryGoals: [],
      budgetLevel: 'modere',
      energyBySlot: { matin: 'moyen', apres_midi: 'moyen', soir: 'moyen' },
    },
  });

  // useWatch plutôt que watch() : watch n'est pas compatible avec la mémoïsation du compilateur React.
  const selectedGoals = useWatch({ control, name: 'primaryGoals' });

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

  return (
    <ScrollView className="flex-1 bg-paper px-6 pt-16" contentContainerStyle={{ paddingBottom: 60 }}>
      <Appear>
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1 text-sm text-primary">
          Bienvenue sur Regain 🌱
        </Text>
        <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-7 text-[28px] leading-8 text-ink">
          Parlons de vous
        </Text>
      </Appear>

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        Quels sont vos objectifs ?
      </Text>
      <SelectMulti
        label="Objectifs"
        title="Quels sont vos objectifs ?"
        placeholder="Choisir un ou plusieurs objectifs"
        values={selectedGoals ?? []}
        options={[...GOAL_OPTIONS]}
        onChange={(values) => setValue('primaryGoals', values)}
      />
      {errors.primaryGoals ? (
        <Text className="mb-5 text-xs text-red-700">{errors.primaryGoals.message}</Text>
      ) : (
        <View className="mb-5" />
      )}

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        Quel est votre budget pour vos activités ?
      </Text>
      <Controller
        control={control}
        name="budgetLevel"
        render={({ field: { value, onChange } }) => (
          <View className="mb-4">
            <Segmented label="Budget" value={value} onChange={onChange} options={[...BUDGET_OPTIONS]} />
          </View>
        )}
      />

      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        Votre énergie habituelle...
      </Text>
      {ENERGY_SLOTS.map((slot) => (
        <View key={slot.key} className="mb-4">
          <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-2 text-xs uppercase tracking-wide text-ink-soft">
            {slot.label}
          </Text>
          <Controller
            control={control}
            name={`energyBySlot.${slot.key}` as const}
            render={({ field: { value, onChange } }) => (
              <Segmented label={slot.label} value={value} onChange={onChange} options={[...ENERGY_LEVELS]} />
            )}
          />
        </View>
      ))}

      {serverError ? <Text className="mb-3 text-xs text-red-700">{serverError}</Text> : null}

      <PressableScale
        onPress={handleSubmit((values) => mutation.mutate(values))}
        disabled={mutation.isPending}
        feedback="medium"
        className="mt-4 overflow-hidden rounded-full shadow-sm"
      >
        <LinearGradient colors={['#F0A324', '#FF6B57']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 15 }}>
          {mutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-center text-white">
              Commencer
            </Text>
          )}
        </LinearGradient>
      </PressableScale>
    </ScrollView>
  );
}
