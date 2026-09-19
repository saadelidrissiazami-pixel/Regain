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
  { title: 'Bienvenue sur Regain 🌱', subtitle: 'Comment veux-tu qu’on t’appelle ?', fields: ['firstName'] },
  { title: 'Qu’est-ce qui compte pour toi ?', subtitle: 'Ton coach choisit tes activités en fonction.', fields: ['primaryGoals'] },
  { title: 'Ton rythme', subtitle: 'Pour placer chaque activité au bon moment.', fields: ['sleepMinutes', 'energyBySlot'] },
  { title: 'Ton budget', subtitle: 'Pour des idées qui te conviennent vraiment.', fields: ['budgetLevel'] },
];

/** Accueil en 4 étapes courtes : une question par écran. */
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
      if (!userId) throw new Error('Session introuvable. Reconnecte-toi puis réessaie.');
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
          <Button label={isLast ? 'Commencer' : 'Continuer'} iconRight={isLast ? undefined : 'arrow-forward'} loading={mutation.isPending} onPress={next} />
          {step > 0 ? <Button label="Retour" variant="ghost" onPress={() => setStep((s) => s - 1)} /> : null}
        </View>
      }
    >
      <View style={{ marginBottom: 28 }}>
        <Text variant="caption" tone="ink2" style={{ marginBottom: 8 }}>
          Étape {step + 1} sur {STEPS.length}
        </Text>
        <ProgressBar progress={(step + 1) / STEPS.length} height={6} />
      </View>

      <Animated.View key={step} entering={FadeIn.duration(220)}>
        <ScreenHeader title={current.title} subtitle={current.subtitle} />

        {step === 0 ? (
          <Field
            label="Ton prénom"
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
              label="Tes objectifs"
              title="Qu’est-ce qui compte pour toi ?"
              values={values.primaryGoals}
              options={[...GOAL_OPTIONS]}
              onChange={(goals) => set('primaryGoals', goals)}
              placeholder="Choisir un ou plusieurs objectifs"
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
            <Select label="Combien d’heures dors-tu d’habitude ?" value={values.sleepMinutes} options={SLEEP_OPTIONS} onChange={(m) => set('sleepMinutes', m)} />
            <Text variant="label" style={{ marginTop: 16, marginBottom: 4 }}>
              Ton énergie habituelle
            </Text>
            {ENERGY_SLOTS.map((slot) => (
              <View key={slot.key} style={{ marginTop: 10 }}>
                <Text variant="caption" tone="ink2" style={{ marginBottom: 6 }}>
                  {slot.label}
                </Text>
                <SegmentedControl<EnergyLevel>
                  label={`Énergie : ${slot.label}`}
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
