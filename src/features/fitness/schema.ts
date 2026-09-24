import { z } from 'zod';

import {
  ACTIVITY_LEVELS,
  DIET_OPTIONS,
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
  FITNESS_GOALS,
  SEX_OPTIONS,
} from './options';
import type { FitnessProfile, FitnessProfileInput } from './types';

function enumOf<T extends readonly { value: string }[]>(options: T) {
  return z.enum(options.map((o) => o.value) as [T[number]['value'], ...T[number]['value'][]]);
}

function parseDecimal(value: string): number {
  return Number(value.trim().replace(',', '.'));
}

function decimalInRange(label: string, min: number, max: number) {
  return z.string().refine((v) => {
    const n = parseDecimal(v);
    return Number.isFinite(n) && n >= min && n <= max;
  }, `${label} : entre ${min} et ${max}`);
}

const currentYear = new Date().getFullYear();

export const fitnessQuestionnaireSchema = z.object({
  goals: z.array(enumOf(FITNESS_GOALS)).min(1, 'Choisis au moins un objectif'),
  sex: enumOf(SEX_OPTIONS),
  // Adults only: calorie and strength plans are not suitable for minors.
  birthYear: z.string().refine((v) => {
    const year = Number(v.trim());
    return Number.isInteger(year) && year >= currentYear - 90 && year <= currentYear - 18;
  }, 'The fitness coach is for adults only (18 and over): enter a valid year of birth'),
  heightCm: decimalInRange('Taille (cm)', 120, 230),
  weightKg: decimalInRange('Poids (kg)', 35, 250),
  activityLevel: enumOf(ACTIVITY_LEVELS),
  experience: enumOf(EXPERIENCE_LEVELS),
  equipment: enumOf(EQUIPMENT_OPTIONS),
  daysPerWeek: z.number().int().min(1).max(6),
  sessionMinutes: z.number().int().min(20).max(120),
  diet: enumOf(DIET_OPTIONS),
  allergies: z.string().max(300, '300 characters maximum'),
  healthNotes: z.string().max(500, '500 characters maximum'),
});

export type FitnessQuestionnaireValues = z.infer<typeof fitnessQuestionnaireSchema>;

export function questionnaireToProfile(values: FitnessQuestionnaireValues): FitnessProfileInput {
  return {
    goals: values.goals,
    sex: values.sex,
    birth_year: Number(values.birthYear.trim()),
    height_cm: Math.round(parseDecimal(values.heightCm)),
    weight_kg: Math.round(parseDecimal(values.weightKg) * 10) / 10,
    activity_level: values.activityLevel,
    experience: values.experience,
    equipment: values.equipment,
    days_per_week: values.daysPerWeek,
    session_minutes: values.sessionMinutes,
    diet: values.diet,
    allergies: values.allergies.trim() || null,
    health_notes: values.healthNotes.trim() || null,
  };
}

export function profileToQuestionnaire(profile: FitnessProfile | null): FitnessQuestionnaireValues {
  return {
    goals: profile?.goals ?? [],
    sex: profile?.sex ?? 'femme',
    birthYear: profile ? String(profile.birth_year) : '',
    heightCm: profile ? String(profile.height_cm) : '',
    weightKg: profile ? String(profile.weight_kg) : '',
    activityLevel: profile?.activity_level ?? 'leger',
    experience: profile?.experience ?? 'debutant',
    equipment: profile?.equipment ?? 'poids_du_corps',
    daysPerWeek: profile?.days_per_week ?? 3,
    sessionMinutes: profile?.session_minutes ?? 45,
    diet: profile?.diet ?? 'omnivore',
    allergies: profile?.allergies ?? '',
    healthNotes: profile?.health_notes ?? '',
  };
}
