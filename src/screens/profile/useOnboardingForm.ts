import { useState } from 'react';

import { onboardingSchema, type OnboardingFormValues } from '../../features/onboarding/schema';

export const DEFAULT_ONBOARDING: OnboardingFormValues = {
  firstName: '',
  sleepMinutes: 450,
  primaryGoals: [],
  budgetLevel: 'modere',
  energyBySlot: { matin: 'moyen', apres_midi: 'moyen', soir: 'moyen' },
};

/** Réponses d'accueil (création ou édition) avec validation zod champ par champ. */
export function useOnboardingForm(initial: OnboardingFormValues = DEFAULT_ONBOARDING) {
  const [values, setValues] = useState<OnboardingFormValues>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingFormValues, string>>>({});

  const set = <K extends keyof OnboardingFormValues>(key: K, value: OnboardingFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  /** Valide les champs demandés (tous par défaut) ; renvoie true si tout va bien. */
  const validate = (keys?: (keyof OnboardingFormValues)[]) => {
    const result = onboardingSchema.safeParse(values);
    if (result.success) return true;
    const next: Partial<Record<keyof OnboardingFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof OnboardingFormValues;
      if ((!keys || keys.includes(key)) && !next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return { values, setValues, set, errors, validate };
}
