import { z } from 'zod';

const energyLevel = z.enum(['bas', 'moyen', 'eleve']);

export const onboardingSchema = z.object({
  primaryGoals: z.array(z.string()).min(1, 'Choisissez au moins un objectif'),
  budgetLevel: z.enum(['gratuit', 'modere', 'confortable']),
  energyBySlot: z.object({
    matin: energyLevel,
    apres_midi: energyLevel,
    soir: energyLevel,
  }),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
