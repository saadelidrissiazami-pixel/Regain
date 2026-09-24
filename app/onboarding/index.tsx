import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { errorMessage, InlineNotice } from '../../src/components/feedback';
import { Button, Field, ProgressBar, Screen, ScreenHeader, SegmentedControl, Select, SelectMulti, Text } from '../../src/components/ui';
import { BUDGET_OPTIONS, ENERGY_LEVELS, ENERGY_SLOTS, GOAL_OPTIONS, SLEEP_OPTIONS } from '../../src/features/onboarding/options';
import type { OnboardingFormValues } from '../../src/features/onboarding/schema';
import type { EnergyLevel } from '../../src/features/planning/catalog';
import { completeOnboarding } from '../../src/lib/profile';
import { useOnboardingForm } from '../../src/screens/profile/useOnboardingForm';
import { useAuthStore } from '../../src/store/authStore';

const STEPS: { title: string; subtitle: string; fields: (keyof OnboardingFormValues)[] }[] = [
  { title: 'Welcome to Regain 🌱', subtitle: 'What should we call you?', fields: ['firstName'] },
  { title: 'What matters to you?', subtitle: 'Your coach picks your activities around this.', fields: ['primaryGoals'] },
  { title: 'Your rhythm', subtitle: 'So each activity lands at the right time.', fields: ['sleepMinutes', 'energyBySlot'] },
  { title: 'Your budget', subtitle: 'So the ideas actually suit you.', fields: ['budgetLevel'] },
];

/** Onboarding in 4 short steps: one question per screen. */
export default function OnboardingScreen() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const form = useOnboardingForm();
  const [step, setStep] = useState(0);
  const { values, set, errors } = form;
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const mutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('No session found. Sign in again, then try once more.');
      return completeOnboarding(userId, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      router.replace('/(tabs)/planning');
    },
  });

  const next = () => {
    if (!form.validate(current.fields)) return;
    if (isLast) mutation.mutate();
    else setStep((s) => s + 1);
  };

  return (
    <Screen
      keyboard
      footer={
        <View style={{ gap: 4 }}>
          {mutation.isError ? <InlineNotice tone="error" message={errorMessage(mutation.error)} /> : null}
          <Button label={isLast ? 'Get started' : 'Continue'} iconRight={isLast ? undefined : 'arrow-forward'} loading={mutation.isPending} onPress={next} />
          {step > 0 ? <Button label="Back" variant="ghost" onPress={() => setStep((s) => s - 1)} /> : null}
        </View>
      }
    >
      <View style={{ marginBottom: 28 }}>
        <Text variant="caption" tone="ink2" style={{ marginBottom: 8 }}>
          Step {step + 1} of {STEPS.length}
        </Text>
        <ProgressBar progress={(step + 1) / STEPS.length} height={6} />
      </View>

      <Animated.View key={step} entering={FadeIn.duration(220)}>
        <ScreenHeader title={current.title} subtitle={current.subtitle} />

        {step === 0 ? (
          <Field
            label="Your first name"
            value={values.firstName}
            onChangeText={(text) => set('firstName', text)}
            placeholder="Ex. : Camille"
            autoFocus
            autoCapitalize="words"
            autoComplete="given-name"
            textContentType="givenName"
            returnKeyType="next"
            onSubmitEditing={next}
            error={errors.firstName}
          />
        ) : null}

        {step === 1 ? (
          <>
            <SelectMulti
              label="Your goals"
              title="What matters to you?"
              values={values.primaryGoals}
              options={[...GOAL_OPTIONS]}
              onChange={(goals) => set('primaryGoals', goals)}
              placeholder="Pick one or more goals"
            />
            {errors.primaryGoals ? (
              <Text variant="caption" tone="danger">
                {errors.primaryGoals}
              </Text>
            ) : null}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Select label="How many hours do you usually sleep?" value={values.sleepMinutes} options={SLEEP_OPTIONS} onChange={(m) => set('sleepMinutes', m)} />
            <Text variant="label" style={{ marginTop: 16, marginBottom: 4 }}>
              Your usual energy
            </Text>
            {ENERGY_SLOTS.map((slot) => (
              <View key={slot.key} style={{ marginTop: 10 }}>
                <Text variant="caption" tone="ink2" style={{ marginBottom: 6 }}>
                  {slot.label}
                </Text>
                <SegmentedControl<EnergyLevel>
                  label={`Energy: ${slot.label}`}
                  tone="surface"
                  value={values.energyBySlot[slot.key]}
                  onChange={(level) => set('energyBySlot', { ...values.energyBySlot, [slot.key]: level })}
                  options={[...ENERGY_LEVELS]}
                />
              </View>
            ))}
          </>
        ) : null}

        {step === 3 ? (
          <SegmentedControl label="Budget" tone="surface" value={values.budgetLevel} onChange={(b) => set('budgetLevel', b)} options={[...BUDGET_OPTIONS]} />
        ) : null}
      </Animated.View>
    </Screen>
  );
}
