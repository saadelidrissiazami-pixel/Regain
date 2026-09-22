import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goBack } from '../../lib/navigation';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { ErrorState, errorMessage, InlineNotice, LoadingSkeleton } from '../../components/feedback';
import { Button, Field, haptic, Screen, ScreenHeader, SegmentedControl, Select, SelectMulti, Text } from '../../components/ui';
import { BUDGET_OPTIONS, ENERGY_LEVELS, ENERGY_SLOTS, GOAL_OPTIONS, SLEEP_OPTIONS } from '../../features/onboarding/options';
import type { EnergyLevel } from '../../features/planning/catalog';
import { fetchPreferences } from '../../lib/planning';
import { completeOnboarding, fetchProfile, fetchSleepMinutes } from '../../lib/profile';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingForm } from './useOnboardingForm';

/** Mes objectifs : prénom, sommeil, objectifs, budget et énergie habituelle, modifiables à tout moment. */
export default function GoalsScreen() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const form = useOnboardingForm();
  const loaded = useRef(false);

  const dataQuery = useQuery({
    queryKey: ['onboardingAnswers', userId],
    queryFn: async () => {
      const [profile, prefs, sleep] = await Promise.all([fetchProfile(userId!), fetchPreferences(userId!), fetchSleepMinutes(userId!)]);
      return { profile, prefs, sleep };
    },
    enabled: !!userId,
  });

  const { setValues } = form;
  useEffect(() => {
    if (!dataQuery.data || loaded.current) return;
    loaded.current = true;
    const { profile, prefs, sleep } = dataQuery.data;
    setValues({
      firstName: profile.display_name ?? '',
      sleepMinutes: sleep ?? 450,
      primaryGoals: prefs.primary_goals ?? [],
      budgetLevel: prefs.budget_level ?? 'modere',
      energyBySlot: {
        matin: prefs.typical_energy_by_slot?.matin ?? 'moyen',
        apres_midi: prefs.typical_energy_by_slot?.apres_midi ?? 'moyen',
        soir: prefs.typical_energy_by_slot?.soir ?? 'moyen',
      },
    });
  }, [dataQuery.data, setValues]);

  const saveMutation = useMutation({
    mutationFn: () => completeOnboarding(userId!, form.values, false),
    onSuccess: () => {
      haptic.success();
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['preferences', userId] });
      queryClient.invalidateQueries({ queryKey: ['sleepMinutes', userId] });
      queryClient.invalidateQueries({ queryKey: ['onboardingAnswers', userId] });
      goBack('/(tabs)/profile');
    },
  });

  const { values, set, errors } = form;

  return (
    <Screen
      keyboard
      footer={
        dataQuery.isSuccess ? (
          <Button label="Enregistrer" loading={saveMutation.isPending} onPress={() => form.validate() && saveMutation.mutate()} />
        ) : undefined
      }
    >
      <ScreenHeader title="Mes objectifs" subtitle="Ton coach s'en sert pour choisir tes activités." onBack={() => goBack('/(tabs)/profile')} />
      {dataQuery.isLoading ? (
        <LoadingSkeleton preset="list" />
      ) : dataQuery.isError ? (
        <ErrorState onRetry={() => dataQuery.refetch()} />
      ) : (
        <>
          <Field
            label="Ton prénom"
            value={values.firstName}
            onChangeText={(text) => set('firstName', text)}
            placeholder="Ex. : Camille"
            autoCapitalize="words"
            autoComplete="given-name"
            textContentType="givenName"
            error={errors.firstName}
          />
          <SelectMulti
            label="Tes objectifs"
            values={values.primaryGoals}
            options={[...GOAL_OPTIONS]}
            onChange={(goals) => set('primaryGoals', goals)}
            placeholder="Choisir un ou plusieurs objectifs"
          />
          {errors.primaryGoals ? (
            <Text variant="caption" tone="danger" style={{ marginTop: -6, marginBottom: 12 }}>
              {errors.primaryGoals}
            </Text>
          ) : null}
          <Select label="Ton sommeil habituel" value={values.sleepMinutes} options={SLEEP_OPTIONS} onChange={(m) => set('sleepMinutes', m)} />

          <Text variant="label" style={{ marginTop: 12, marginBottom: 8 }}>
            Ton budget pour les activités
          </Text>
          <SegmentedControl label="Budget" tone="surface" value={values.budgetLevel} onChange={(b) => set('budgetLevel', b)} options={[...BUDGET_OPTIONS]} />

          <Text variant="label" style={{ marginTop: 24, marginBottom: 4 }}>
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
          {saveMutation.isError ? <InlineNotice tone="error" message={errorMessage(saveMutation.error)} /> : null}
        </>
      )}
    </Screen>
  );
}
