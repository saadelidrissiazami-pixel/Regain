import type { NutritionTargets } from './nutrition';
import type { ActivityLevel, Diet, Equipment, ExperienceLevel, FitnessGoal, Sex } from './options';

export type FitnessProfileInput = {
  goals: FitnessGoal[];
  sex: Sex;
  birth_year: number;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  experience: ExperienceLevel;
  equipment: Equipment;
  days_per_week: number;
  session_minutes: number;
  diet: Diet;
  allergies: string | null;
  health_notes: string | null;
};

export type FitnessProfile = FitnessProfileInput & { user_id: string };

// The shape of the programme the agent returns (the fitness-coach Edge Function): any change
// here has to be mirrored in that function's zod schema.
export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  tip: string;
};

export type WorkoutSession = {
  day_label: string;
  focus: string;
  duration_minutes: number;
  warmup: string;
  exercises: Exercise[];
  cooldown: string;
};

export type Meal = {
  name: string;
  description: string;
  calories: number;
  protein_g: number;
};

export type MealDay = {
  day_label: string;
  total_calories: number;
  meals: Meal[];
};

export type ShoppingItem = {
  item: string;
  quantity: string;
  category: string;
};

export type FitnessPlan = {
  id: string;
  user_id: string;
  targets: NutritionTargets;
  program: WorkoutSession[];
  meals: MealDay[];
  shopping_list: ShoppingItem[];
  coach_notes: string | null;
  created_at: string;
};

export type FitnessCheckinInput = {
  weight_kg: number | null;
  sessions_done: number;
  energy: number;
  note: string | null;
};

export type FitnessCheckin = FitnessCheckinInput & { id: string; created_at: string };
