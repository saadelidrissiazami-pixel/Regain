import { z } from 'zod';

const energyLevel = z.enum(['bas', 'moyen', 'eleve']);

export const onboardingSchema = z.object({
  firstName: z.string().trim().min(1, 'Comment veux-tu qu’on t’appelle ?').max(40, '40 caractères maximum'),
  /** Durée de sommeil habituelle, en minutes. */
  sleepMinutes: z.number().int().min(180).max(780).nullable(),
  primaryGoals: z.array(z.string()).min(1, 'Choisis au moins un objectif'),
  budgetLevel: z.enum(['gratuit', 'modere', 'confortable']),
  energyBySlot: z.object({
    matin: energyLevel,
    apres_midi: energyLevel,
    soir: energyLevel,
  }),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
