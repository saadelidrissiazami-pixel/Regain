import { EXERCISES, type ExerciseDef, type JointStress, type MuscleGroup } from './exercises';
import { INGREDIENTS, type Allergen, type AnimalSource, type Ingredient, type IngredientId } from './ingredients';
import type { NutritionTargets } from './nutrition';
import type { Diet, Equipment, ExperienceLevel, FitnessGoal } from './options';
import { RECIPES, type MealType, type Recipe } from './recipes';
import type {
  Exercise,
  FitnessCheckinInput,
  FitnessProfileInput,
  MealDay,
  ShoppingItem,
  WorkoutSession,
} from './types';

// A rule-based generator, no AI: free, instant, and no health data leaves the user's own rows.
// Deterministic for a given `seed`, so it can be tested.

// --- Does the plan still match the profile? -------------------------------------------------

function sameValue(previous: unknown, next: unknown): boolean {
  if (Array.isArray(previous) && Array.isArray(next)) {
    // Goals are a list: their order makes no difference to the programme produced.
    return previous.length === next.length && [...previous].sort().join('|') === [...next].sort().join('|');
  }
  const isText = (v: unknown) => v === null || typeof v === 'string';
  // Allergies and health notes are typed by hand: one extra space is not a change.
  if (isText(previous) && isText(next)) return ((previous as string) ?? '').trim() === ((next as string) ?? '').trim();
  return previous === next;
}

/**
 * Has the profile changed in a way that makes the plan on screen wrong?
 *
 * **Every** field is compared rather than a chosen few: each one feeds the generation (calories,
 * the choice of exercises, dietary exclusions), and a hand-maintained list would eventually
 * forget a field added later — an omission that would leave meals containing a declared allergen
 * on screen. The training slot and training days are deliberately not in `FitnessProfileInput`:
 * they only affect display and must not regenerate anything.
 */
export function affectsPlan(previous: FitnessProfileInput, next: FitnessProfileInput): boolean {
  // We walk the keys of `next`, never the union of both: `previous` comes from the database,
  // where `select('*')` also brings back user_id, created_at, training_slot… none of which exist
  // on the profile rebuilt from the form. Comparing the union saw those vanish every time, so the
  // function always answered true — a recalculation on every save, even with nothing changed.
  return (Object.keys(next) as (keyof FitnessProfileInput)[]).some((key) => !sameValue(previous[key], next[key]));
}

// --- Reading the free-text fields (allergies, health) ---------------------------------------

function normalize(text: string): string {
  return text.toLowerCase().replace(/œ/g, 'oe').normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// The keyword has to be a whole word, with an optional plural `s`. An open-ended prefix match
// was fine against French words but is dangerous in English: `nut` would fire on “nutrition”,
// `cod` on “codeine” and `disc` on “discomfort” — each one silently stripping food or exercises
// out of somebody's plan because of a word that had nothing to do with it.
function mentions(text: string, keywords: string[]): boolean {
  const normalized = normalize(text);
  return keywords.some((keyword) => new RegExp(`\\b${keyword}s?\\b`).test(normalized));
}

// Matched against what the person typed, so the words are the ones they would write.
const ALLERGY_KEYWORDS: Record<Allergen, string[]> = {
  gluten: ['gluten', 'wheat', 'coeliac', 'celiac'],
  lactose: ['lactose', 'milk', 'dairy', 'cheese'],
  oeufs: ['egg'],
  arachides: ['peanut', 'groundnut'],
  fruits_a_coque: ['nut', 'almond', 'hazelnut', 'cashew', 'pistachio', 'walnut', 'pecan'],
  poisson: ['fish', 'salmon', 'cod', 'tuna'],
  crustaces: ['shellfish', 'crustacean', 'prawn', 'shrimp', 'crab', 'lobster'],
  soja: ['soy', 'soya'],
  sesame: ['sesame', 'tahini'],
};

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  gluten: 'gluten',
  lactose: 'lactose',
  oeufs: 'eggs',
  arachides: 'peanuts',
  fruits_a_coque: 'tree nuts',
  poisson: 'fish',
  crustaces: 'shellfish',
  soja: 'soya',
  sesame: 'sesame',
};

export function parseAllergies(text: string): Allergen[] {
  return (Object.keys(ALLERGY_KEYWORDS) as Allergen[]).filter((allergen) => mentions(text, ALLERGY_KEYWORDS[allergen]));
}

const JOINT_KEYWORDS: Record<JointStress, string[]> = {
  genou: ['knee', 'meniscus', 'kneecap', 'patella', 'cruciate', 'acl'],
  dos: ['back', 'lumbar', 'hernia', 'sciatica', 'spine', 'disc'],
  epaule: ['shoulder', 'rotator cuff'],
};

const JOINT_LABELS: Record<JointStress, string> = { genou: 'knee', dos: 'back', epaule: 'shoulder' };

export function detectJointIssues(text: string): JointStress[] {
  return (Object.keys(JOINT_KEYWORDS) as JointStress[]).filter((joint) => mentions(text, JOINT_KEYWORDS[joint]));
}

// --- Sessions --------------------------------------------------------------------------------

const EQUIPMENT_RANK: Record<Equipment, number> = { poids_du_corps: 0, halteres_maison: 1, salle: 2 };
const LEVEL_RANK: Record<ExperienceLevel, number> = { debutant: 0, intermediaire: 1, confirme: 2 };

const WARMUP = '5 min: mobility for the shoulders, hips and ankles, then 2 min of easy cardio.';
const COOLDOWN = '5 min of gentle stretching for the muscles you worked, and a few slow breaths.';
const WARMUP_AND_COOLDOWN_MINUTES = 10;
const WORK_SECONDS_PER_SET = 45;

type SplitDay = { focus: string; slots: MuscleGroup[] };

function splitFor(daysPerWeek: number): { name: string; days: SplitDay[] } {
  if (daysPerWeek <= 3) {
    const fullBody: SplitDay[] = [
      { focus: 'Full body A', slots: ['jambes', 'pectoraux', 'dos', 'fessiers', 'epaules', 'abdos', 'biceps'] },
      { focus: 'Full body B', slots: ['fessiers', 'dos', 'pectoraux', 'jambes', 'triceps', 'abdos', 'epaules'] },
      { focus: 'Full body C', slots: ['jambes', 'dos', 'epaules', 'pectoraux', 'fessiers', 'abdos', 'biceps'] },
    ];
    return { name: 'full body', days: fullBody.slice(0, daysPerWeek) };
  }
  if (daysPerWeek === 4) {
    const upper: SplitDay = { focus: 'Upper body', slots: ['pectoraux', 'dos', 'epaules', 'biceps', 'triceps', 'dos', 'abdos'] };
    const lower: SplitDay = { focus: 'Lower body', slots: ['jambes', 'fessiers', 'jambes', 'abdos', 'fessiers', 'jambes', 'abdos'] };
    return { name: 'an upper / lower split', days: [upper, lower, upper, lower] };
  }
  const push: SplitDay = { focus: 'Push — chest, shoulders, triceps', slots: ['pectoraux', 'epaules', 'triceps', 'pectoraux', 'epaules', 'abdos', 'triceps'] };
  const pull: SplitDay = { focus: 'Pull — back, biceps', slots: ['dos', 'dos', 'biceps', 'epaules', 'abdos', 'dos', 'biceps'] };
  const legs: SplitDay = { focus: 'Legs and glutes', slots: ['jambes', 'fessiers', 'jambes', 'fessiers', 'abdos', 'jambes', 'abdos'] };
  return { name: 'a push / pull / legs split', days: [push, pull, legs, push, pull, legs].slice(0, daysPerWeek) };
}

type Scheme = { sets: number; reps: string; rest: number };

function schemeFor(goals: FitnessGoal[], experience: ExperienceLevel): Scheme {
  if (goals.includes('prise_masse')) return { sets: 4, reps: '8-10', rest: 90 };
  if (goals.includes('perte_poids')) return { sets: 3, reps: '12-15', rest: 45 };
  if (goals.includes('endurance')) return { sets: 3, reps: '15-20', rest: 30 };
  if (goals.includes('tonifier')) return { sets: 3, reps: '12-15', rest: 60 };
  if (goals.includes('salle')) return { sets: experience === 'confirme' ? 4 : 3, reps: '10-12', rest: 75 };
  return { sets: experience === 'debutant' ? 2 : 3, reps: '10-12', rest: 60 };
}

function exerciseCountFor(sessionMinutes: number): number {
  if (sessionMinutes <= 30) return 4;
  if (sessionMinutes <= 45) return 5;
  if (sessionMinutes <= 60) return 6;
  return 7;
}

export type Intensity = -1 | 0 | 1;

/** Weekly check-in → an easier week, the same one, or a step up. */
export function intensityFromCheckin(
  checkin: Pick<FitnessCheckinInput, 'sessions_done' | 'energy'> | undefined,
  daysPerWeek: number
): Intensity {
  if (!checkin) return 0;
  if (checkin.energy <= 2 || checkin.sessions_done < Math.ceil(daysPerWeek / 2)) return -1;
  if (checkin.energy >= 4 && checkin.sessions_done >= daysPerWeek) return 1;
  return 0;
}

function isExerciseAllowed(def: ExerciseDef, profile: FitnessProfileInput, jointIssues: JointStress[]): boolean {
  return (
    EQUIPMENT_RANK[def.equipment] <= EQUIPMENT_RANK[profile.equipment] &&
    LEVEL_RANK[def.minLevel] <= LEVEL_RANK[profile.experience] &&
    !def.stress.some((joint) => jointIssues.includes(joint))
  );
}

function estimateMinutes(exercises: Exercise[]): number {
  const seconds = exercises.reduce((total, e) => total + e.sets * (WORK_SECONDS_PER_SET + e.rest_seconds), 0);
  return WARMUP_AND_COOLDOWN_MINUTES + seconds / 60;
}

export function buildWorkoutProgram(
  profile: FitnessProfileInput,
  { seed = 0, intensity = 0 }: { seed?: number; intensity?: Intensity } = {}
): WorkoutSession[] {
  const jointIssues = detectJointIssues(profile.health_notes ?? '');
  const scheme = schemeFor(profile.goals, profile.experience);
  const maxSets = profile.experience === 'debutant' ? 3 : 5;
  const sets = Math.min(maxSets, Math.max(2, scheme.sets + intensity));
  const wantsFinisher = profile.goals.includes('endurance') || profile.goals.includes('perte_poids');

  return splitFor(profile.days_per_week).days.map((day, sessionIndex) => {
    const used = new Set<string>();
    const main: Exercise[] = [];

    day.slots.slice(0, exerciseCountFor(profile.session_minutes)).forEach((group, slotIndex) => {
      const candidates = EXERCISES.filter(
        (def) => def.group === group && !used.has(def.name) && isExerciseAllowed(def, profile, jointIssues)
      );
      if (candidates.length === 0) return;
      const def = candidates[(seed + sessionIndex * 3 + slotIndex) % candidates.length];
      used.add(def.name);
      main.push({ name: def.name, sets, reps: def.timed ?? scheme.reps, rest_seconds: scheme.rest, tip: def.tip });
    });

    let finisher: Exercise | null = null;
    if (wantsFinisher) {
      const cardio = EXERCISES.filter((def) => def.group === 'cardio' && isExerciseAllowed(def, profile, jointIssues));
      if (cardio.length > 0) {
        const def = cardio[(seed + sessionIndex) % cardio.length];
        finisher = def.timed
          ? { name: def.name, sets: 1, reps: def.timed, rest_seconds: 0, tip: `Cardio finisher: ${def.tip}` }
          : { name: def.name, sets: 4, reps: '30 s', rest_seconds: 30, tip: `Cardio finisher: ${def.tip}` };
      }
    }

    // The session has to fit the time available: drop exercises first (never below 3), then the
    // finisher, then one set everywhere.
    const fits = () => estimateMinutes(finisher ? [...main, finisher] : main) <= profile.session_minutes;
    while (!fits()) {
      if (main.length > 3) main.pop();
      else if (finisher) finisher = null;
      else if (main.some((e) => e.sets > 2)) main.forEach((e) => (e.sets = Math.max(2, e.sets - 1)));
      else break;
    }

    const exercises = finisher ? [...main, finisher] : main;
    return {
      day_label: `Session ${sessionIndex + 1}`,
      focus: day.focus,
      duration_minutes: Math.min(profile.session_minutes, Math.ceil(estimateMinutes(exercises) / 5) * 5),
      warmup: WARMUP,
      exercises,
      cooldown: COOLDOWN,
    };
  });
}

// --- Meals -----------------------------------------------------------------------------------

const EXCLUDED_ANIMALS: Record<Diet, AnimalSource[]> = {
  omnivore: [],
  halal: ['porc'],
  pescetarien: ['viande', 'porc', 'volaille'],
  vegetarien: ['viande', 'porc', 'volaille', 'poisson', 'crustaces'],
  vegan: ['viande', 'porc', 'volaille', 'poisson', 'crustaces', 'oeuf', 'laitier'],
};

const MEAL_LABELS: Record<MealType, string> = {
  petit_dejeuner: 'Breakfast',
  dejeuner: 'Lunch',
  diner: 'Dinner',
  collation: 'Snack',
};

// The order the shopping list is grouped in, roughly the order of a supermarket's aisles.
const CATEGORY_ORDER = [
  'Fruit and vegetables',
  'Protein',
  'Grains and starches',
  'Dairy and alternatives',
  'Store cupboard',
];

export function isRecipeCompatible(recipe: Recipe, diet: Diet, allergens: Allergen[]): boolean {
  return recipe.ingredients.every(({ id }) => {
    const ingredient = INGREDIENTS[id];
    const animalOk = !ingredient.animal || !EXCLUDED_ANIMALS[diet].includes(ingredient.animal);
    const allergenOk = !ingredient.allergens.some((a) => allergens.includes(a));
    return animalOk && allergenOk;
  });
}

type Portion = { id: IngredientId; amount: number };

function scaleAmount({ id, amount }: Portion, factor: number): number {
  const ingredient = INGREDIENTS[id];
  if (ingredient.gramsPerPiece) {
    const step = ingredient.allowHalfPiece ? 0.5 : 1;
    const pieces = Math.max(step, Math.round((amount * factor) / ingredient.gramsPerPiece / step) * step);
    return pieces * ingredient.gramsPerPiece;
  }
  return Math.max(5, Math.round((amount * factor) / 5) * 5);
}

function nutritionOf(portions: Portion[]): { kcal: number; protein: number } {
  return portions.reduce(
    (total, { id, amount }) => ({
      kcal: total.kcal + (amount / 100) * INGREDIENTS[id].kcalPer100,
      protein: total.protein + (amount / 100) * INGREDIENTS[id].proteinPer100,
    }),
    { kcal: 0, protein: 0 }
  );
}

function formatDecimal(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function formatPieces(pieces: number, label: string): string {
  const count = pieces === 0.5 ? '½' : Number.isInteger(pieces) ? String(pieces) : `${Math.floor(pieces)}½`;
  return `${count} ${label}${pieces > 1 ? 's' : ''}`;
}

function describePortion({ id, amount }: Portion): string {
  const ingredient = INGREDIENTS[id];
  if (ingredient.gramsPerPiece && ingredient.pieceLabel) {
    return formatPieces(amount / ingredient.gramsPerPiece, ingredient.pieceLabel);
  }
  return `${amount} ${ingredient.unit} ${ingredient.name}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** The amount to buy, rounded up so you never come up short. */
export function formatQuantity(amount: number, ingredient: Ingredient): string {
  if (ingredient.gramsPerPiece) return String(Math.ceil(amount / ingredient.gramsPerPiece - 1e-9));
  const rounded = Math.ceil(amount / 10) * 10;
  if (rounded >= 1000) return `${formatDecimal(rounded / 1000)} ${ingredient.unit === 'ml' ? 'L' : 'kg'}`;
  return `${rounded} ${ingredient.unit}`;
}

// A seven-day week built from 3 sample days in rotation: A, B, C, A, B, C, A.
const WEEKLY_REPETITIONS = [3, 2, 2];
const DAY_LETTERS = ['A', 'B', 'C'];

export type MealPlan = {
  days: MealDay[];
  shoppingList: ShoppingItem[];
  warnings: string[];
  usedIngredientIds: IngredientId[];
};

export function buildMealPlan(profile: FitnessProfileInput, targets: NutritionTargets, seed = 0): MealPlan {
  const allergens = parseAllergies(profile.allergies ?? '');
  // Muscle-building targets (at least 25% of calories from protein): only the highest-protein
  // recipes go into the rotation, and a protein snack is added even on a small calorie budget.
  const needsHighProtein = (targets.proteinG * 4) / targets.calories >= 0.25;
  const snackCount = targets.calories > 2600 ? 2 : targets.calories > 1900 || needsHighProtein ? 1 : 0;
  const slots: MealType[] = ['petit_dejeuner', 'dejeuner', 'diner', ...Array<MealType>(snackCount).fill('collation')];
  const proteinDensity = (recipe: Recipe) => {
    const { kcal, protein } = nutritionOf(recipe.ingredients);
    return protein / kcal;
  };
  const optionsFor = (type: MealType) => {
    const compatible = RECIPES.filter(
      (r) => r.mealType === type && isRecipeCompatible(r, profile.diet, allergens)
    ).sort((a, b) => proteinDensity(b) - proteinDensity(a));
    return needsHighProtein ? compatible.slice(0, Math.max(3, Math.ceil(compatible.length / 2))) : compatible;
  };

  const warnings: string[] = [];
  for (const type of new Set(slots)) {
    if (optionsFor(type).length === 0) {
      warnings.push(
        `No ${MEAL_LABELS[type].toLowerCase()} recipe fits your restrictions — put this meal together yourself.`
      );
    }
  }

  const plannedDays = DAY_LETTERS.map((_, dayIndex) => {
    const recipes = slots.flatMap((type, slotIndex) => {
      const options = optionsFor(type);
      return options.length > 0 ? [options[(seed + dayIndex + slotIndex * 2) % options.length]] : [];
    });
    // Portions are scaled to reach the calorie target, within reason.
    const baseKcal = recipes.reduce((total, r) => total + nutritionOf(r.ingredients).kcal, 0);
    const factor = baseKcal > 0 ? Math.min(1.8, Math.max(0.75, targets.calories / baseKcal)) : 1;
    return recipes.map((recipe) => ({
      recipe,
      portions: recipe.ingredients.map((p) => ({ id: p.id, amount: scaleAmount(p, factor) })),
    }));
  });

  const days: MealDay[] = plannedDays.map((meals, dayIndex) => {
    const described = meals.map(({ recipe, portions }) => {
      const { kcal, protein } = nutritionOf(portions);
      return {
        name: `${MEAL_LABELS[recipe.mealType]} — ${recipe.name}`,
        description: capitalize(portions.map(describePortion).join(', ')),
        calories: Math.round(kcal),
        protein_g: Math.round(protein),
      };
    });
    return {
      day_label: `Day ${DAY_LETTERS[dayIndex]}`,
      total_calories: described.reduce((total, m) => total + m.calories, 0),
      meals: described,
    };
  });

  const totals = new Map<IngredientId, number>();
  plannedDays.forEach((meals, dayIndex) => {
    for (const { portions } of meals) {
      for (const { id, amount } of portions) {
        totals.set(id, (totals.get(id) ?? 0) + amount * WEEKLY_REPETITIONS[dayIndex]);
      }
    }
  });
  const shoppingList: ShoppingItem[] = Array.from(totals.entries())
    .map(([id, amount]) => ({
      item: capitalize(INGREDIENTS[id].name),
      quantity: formatQuantity(amount, INGREDIENTS[id]),
      category: INGREDIENTS[id].category,
    }))
    .sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.item.localeCompare(b.item, 'en')
    );

  const averageProtein =
    plannedDays.reduce((total, meals) => total + nutritionOf(meals.flatMap((m) => m.portions)).protein, 0) /
    plannedDays.length;
  if (averageProtein < targets.proteinG * 0.8) {
    warnings.push(
      `These days come to about ${Math.round(averageProtein)} g of protein against a target of ${targets.proteinG} g. Add a portion of tofu, pulses or yoghurt if you need to.`
    );
  }

  const usedIngredientIds = Array.from(totals.keys());
  if (
    profile.diet === 'halal' &&
    usedIngredientIds.some((id) => ['viande', 'volaille'].includes(INGREDIENTS[id].animal ?? ''))
  ) {
    warnings.push('Choose certified halal meat and poultry.');
  }

  if (profile.allergies?.trim()) {
    warnings.push(
      allergens.length > 0
        ? `Allergies excluded automatically: ${allergens.map((a) => ALLERGEN_LABELS[a]).join(', ')}. If another allergy is not in that list, check each recipe and read the labels.`
        : 'Your allergy could not be recognised automatically: check each recipe and read the labels.'
    );
  }

  return { days, shoppingList, warnings, usedIngredientIds };
}

// --- The whole programme ---------------------------------------------------------------------

const STRATEGY_NOTES: Record<NutritionTargets['strategy'], string> = {
  deficit: 'The aim: a gradual loss, on a slight calorie deficit, with sessions that protect your muscle.',
  surplus: 'The aim: gradual gain, on a slight calorie surplus, with weights that creep up over time.',
  maintien: 'The aim: keeping your fitness and your energy, with nothing to restrict.',
};

const INTENSITY_NOTES: Record<Intensity, string> = {
  [-1]: 'An easier week: one set fewer, to recover without guilt.',
  0: 'We keep the same rhythm this week.',
  1: 'A good week: one extra set on each exercise, to keep progressing.',
};

export function generateFitnessPlan(
  profile: FitnessProfileInput,
  targets: NutritionTargets,
  { seed = 0, checkin }: { seed?: number; checkin?: Pick<FitnessCheckinInput, 'sessions_done' | 'energy'> } = {}
): { program: WorkoutSession[]; meals: MealDay[]; shopping_list: ShoppingItem[]; coach_notes: string } {
  const intensity = intensityFromCheckin(checkin, profile.days_per_week);
  const program = buildWorkoutProgram(profile, { seed, intensity });
  const mealPlan = buildMealPlan(profile, targets, seed);
  const jointIssues = detectJointIssues(profile.health_notes ?? '');

  const sessionsWord = profile.days_per_week > 1 ? 'sessions' : 'session';
  const notes = [
    STRATEGY_NOTES[targets.strategy],
    `${profile.days_per_week} ${sessionsWord} a week, on ${splitFor(profile.days_per_week).name}.`,
  ];
  if (checkin) notes.push(INTENSITY_NOTES[intensity]);
  if (jointIssues.length > 0) {
    notes.push(
      `You reported trouble with your ${jointIssues.map((j) => JOINT_LABELS[j]).join(', ')}, so the exercises that load it have been removed. Ask a health professional before you start again.`
    );
  } else if (profile.health_notes?.trim()) {
    notes.push('You mentioned something about your health: have this programme checked by a professional before you begin.');
  }
  notes.push(...mealPlan.warnings);

  return {
    program,
    meals: mealPlan.days,
    shopping_list: mealPlan.shoppingList,
    coach_notes: notes.join(' '),
  };
}
