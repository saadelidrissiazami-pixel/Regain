import { z } from 'zod';

const energyLevel = z.enum(['bas', 'moyen', 'eleve']);

export const onboardingSchema = z.object({
  firstName: z.string().trim().min(1, 'What should we call you?').max(40, '40 characters maximum'),
  /** Usual sleep duration, in minutes. */
  sleepMinutes: z.number().int().min(180).max(780).nullable(),
  primaryGoals: z.array(z.string()).min(1, 'Pick at least one goal'),
  budgetLevel: z.enum(['gratuit', 'modere', 'confortable']),
  energyBySlot: z.object({
    matin: energyLevel,
    apres_midi: energyLevel,
    soir: energyLevel,
  }),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
