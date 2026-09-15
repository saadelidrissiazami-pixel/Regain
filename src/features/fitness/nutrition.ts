import type { ActivityLevel, FitnessGoal, Sex } from './options';

// Les calories sont calculées ici, de façon déterministe et testée — jamais par l'IA.
// L'agent compose ensuite les menus à l'intérieur de ces cibles.

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentaire: 1.2,
  leger: 1.375,
  modere: 1.55,
  actif: 1.725,
};

// Plancher de sécurité : jamais sous ce seuil, ni sous le métabolisme de base. Particulièrement
// important pour un public en sortie de burn-out, où la restriction sévère est à proscrire.
const SEX_CALORIE_FLOOR: Record<Sex, number> = { femme: 1200, homme: 1500 };

const MAX_DEFICIT_KCAL = 500;
const MAX_DEFICIT_RATIO = 0.2;
const MAX_SURPLUS_KCAL = 300;
const MAX_SURPLUS_RATIO = 0.1;
const FAT_SHARE_OF_CALORIES = 0.28;

export type NutritionStrategy = 'deficit' | 'surplus' | 'maintien';

export type NutritionInput = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goals: FitnessGoal[];
};

export type NutritionTargets = {
  bmr: number;
  maintenance: number;
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  strategy: NutritionStrategy;
  floorApplied: boolean;
};

export function ageFromBirthYear(birthYear: number, today = new Date()): number {
  return today.getFullYear() - birthYear;
}

/** Métabolisme de base, équation de Mifflin-St Jeor. */
export function computeBmr({ sex, age, heightCm, weightKg }: Omit<NutritionInput, 'activityLevel' | 'goals'>): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'homme' ? 5 : -161);
}

export function strategyForGoals(goals: FitnessGoal[]): NutritionStrategy {
  const wantsLoss = goals.includes('perte_poids');
  const wantsGain = goals.includes('prise_masse');
  // Objectifs contradictoires : on reste à l'équilibre (recomposition) plutôt que de trancher.
  if (wantsLoss && !wantsGain) return 'deficit';
  if (wantsGain && !wantsLoss) return 'surplus';
  return 'maintien';
}

function roundTo10(value: number): number {
  return Math.round(value / 10) * 10;
}

export function computeNutritionTargets(input: NutritionInput): NutritionTargets {
  const bmr = computeBmr(input);
  const maintenance = bmr * ACTIVITY_FACTORS[input.activityLevel];
  const strategy = strategyForGoals(input.goals);

  const raw =
    strategy === 'deficit'
      ? maintenance - Math.min(MAX_DEFICIT_KCAL, maintenance * MAX_DEFICIT_RATIO)
      : strategy === 'surplus'
        ? maintenance + Math.min(MAX_SURPLUS_KCAL, maintenance * MAX_SURPLUS_RATIO)
        : maintenance;

  const floor = Math.max(SEX_CALORIE_FLOOR[input.sex], bmr);
  const floorApplied = raw < floor;
  // Le plancher est arrondi vers le haut : un arrondi au plus proche pourrait repasser dessous.
  const calories = Math.max(roundTo10(raw), Math.ceil(floor / 10) * 10);

  const buildsOrPreservesMuscle = input.goals.some((g) =>
    ['perte_poids', 'prise_masse', 'salle', 'tonifier'].includes(g)
  );
  const proteinG = Math.round(input.weightKg * (buildsOrPreservesMuscle ? 1.8 : 1.4));
  const fatG = Math.round((calories * FAT_SHARE_OF_CALORIES) / 9);
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));

  return {
    bmr: Math.round(bmr),
    maintenance: roundTo10(maintenance),
    calories,
    proteinG,
    fatG,
    carbsG,
    strategy,
    floorApplied,
  };
}
