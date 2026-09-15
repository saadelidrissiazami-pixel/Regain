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

// Générateur par règles, sans IA : gratuit, instantané, et aucune donnée de santé ne quitte la
// base de l'utilisateur. Déterministe pour un même `seed`, pour être testable.

// --- Lecture des textes libres (allergies, santé) -------------------------------------------

function normalize(text: string): string {
  return text.toLowerCase().replace(/œ/g, 'oe').normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function mentions(text: string, keywords: string[]): boolean {
  const normalized = normalize(text);
  return keywords.some((keyword) => new RegExp(`\\b${keyword}`).test(normalized));
}

const ALLERGY_KEYWORDS: Record<Allergen, string[]> = {
  gluten: ['gluten', 'ble', 'froment', 'coeliaque', 'celiaque'],
  lactose: ['lactose', 'lait', 'laitier', 'fromage'],
  oeufs: ['oeuf'],
  arachides: ['arachide', 'cacahuete'],
  fruits_a_coque: ['noix', 'amande', 'noisette', 'cajou', 'pistache', 'fruits? a coque'],
  poisson: ['poisson'],
  crustaces: ['crustace', 'crevette', 'fruits de mer'],
  soja: ['soja'],
  sesame: ['sesame'],
};

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  gluten: 'gluten',
  lactose: 'lactose',
  oeufs: 'œufs',
  arachides: 'arachides',
  fruits_a_coque: 'fruits à coque',
  poisson: 'poisson',
  crustaces: 'crustacés',
  soja: 'soja',
  sesame: 'sésame',
};

export function parseAllergies(text: string): Allergen[] {
  return (Object.keys(ALLERGY_KEYWORDS) as Allergen[]).filter((allergen) => mentions(text, ALLERGY_KEYWORDS[allergen]));
}

const JOINT_KEYWORDS: Record<JointStress, string[]> = {
  genou: ['genou', 'menisque', 'rotule', 'ligament croise'],
  dos: ['dos', 'lombaire', 'hernie', 'sciatique', 'colonne'],
  epaule: ['epaule', 'coiffe des rotateurs'],
};

const JOINT_LABELS: Record<JointStress, string> = { genou: 'genou', dos: 'dos', epaule: 'épaule' };

export function detectJointIssues(text: string): JointStress[] {
  return (Object.keys(JOINT_KEYWORDS) as JointStress[]).filter((joint) => mentions(text, JOINT_KEYWORDS[joint]));
}

// --- Séances ---------------------------------------------------------------------------------

const EQUIPMENT_RANK: Record<Equipment, number> = { poids_du_corps: 0, halteres_maison: 1, salle: 2 };
const LEVEL_RANK: Record<ExperienceLevel, number> = { debutant: 0, intermediaire: 1, confirme: 2 };

const WARMUP = "5 min : mobilité des épaules, des hanches et des chevilles, puis 2 min de cardio doux.";
const COOLDOWN = '5 min d’étirements doux des muscles travaillés et quelques respirations lentes.';
const WARMUP_AND_COOLDOWN_MINUTES = 10;
const WORK_SECONDS_PER_SET = 45;

type SplitDay = { focus: string; slots: MuscleGroup[] };

function splitFor(daysPerWeek: number): { name: string; days: SplitDay[] } {
  if (daysPerWeek <= 3) {
    const fullBody: SplitDay[] = [
      { focus: 'Corps entier A', slots: ['jambes', 'pectoraux', 'dos', 'fessiers', 'epaules', 'abdos', 'biceps'] },
      { focus: 'Corps entier B', slots: ['fessiers', 'dos', 'pectoraux', 'jambes', 'triceps', 'abdos', 'epaules'] },
      { focus: 'Corps entier C', slots: ['jambes', 'dos', 'epaules', 'pectoraux', 'fessiers', 'abdos', 'biceps'] },
    ];
    return { name: 'corps entier', days: fullBody.slice(0, daysPerWeek) };
  }
  if (daysPerWeek === 4) {
    const upper: SplitDay = { focus: 'Haut du corps', slots: ['pectoraux', 'dos', 'epaules', 'biceps', 'triceps', 'dos', 'abdos'] };
    const lower: SplitDay = { focus: 'Bas du corps', slots: ['jambes', 'fessiers', 'jambes', 'abdos', 'fessiers', 'jambes', 'abdos'] };
    return { name: 'haut / bas du corps', days: [upper, lower, upper, lower] };
  }
  const push: SplitDay = { focus: 'Poussée — pectoraux, épaules, triceps', slots: ['pectoraux', 'epaules', 'triceps', 'pectoraux', 'epaules', 'abdos', 'triceps'] };
  const pull: SplitDay = { focus: 'Tirage — dos, biceps', slots: ['dos', 'dos', 'biceps', 'epaules', 'abdos', 'dos', 'biceps'] };
  const legs: SplitDay = { focus: 'Jambes et fessiers', slots: ['jambes', 'fessiers', 'jambes', 'fessiers', 'abdos', 'jambes', 'abdos'] };
  return { name: 'poussée / tirage / jambes', days: [push, pull, legs, push, pull, legs].slice(0, daysPerWeek) };
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

/** Bilan hebdo → semaine allégée, identique ou en progression. */
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
          ? { name: def.name, sets: 1, reps: def.timed, rest_seconds: 0, tip: `Finisher cardio : ${def.tip}` }
          : { name: def.name, sets: 4, reps: '30 s', rest_seconds: 30, tip: `Finisher cardio : ${def.tip}` };
      }
    }

    // La séance doit tenir dans le temps disponible : on retire d'abord des exercices (jamais
    // sous 3), puis le finisher, puis une série partout.
    const fits = () => estimateMinutes(finisher ? [...main, finisher] : main) <= profile.session_minutes;
    while (!fits()) {
      if (main.length > 3) main.pop();
      else if (finisher) finisher = null;
      else if (main.some((e) => e.sets > 2)) main.forEach((e) => (e.sets = Math.max(2, e.sets - 1)));
      else break;
    }

    const exercises = finisher ? [...main, finisher] : main;
    return {
      day_label: `Séance ${sessionIndex + 1}`,
      focus: day.focus,
      duration_minutes: Math.min(profile.session_minutes, Math.ceil(estimateMinutes(exercises) / 5) * 5),
      warmup: WARMUP,
      exercises,
      cooldown: COOLDOWN,
    };
  });
}

// --- Repas -----------------------------------------------------------------------------------

const EXCLUDED_ANIMALS: Record<Diet, AnimalSource[]> = {
  omnivore: [],
  halal: ['porc'],
  pescetarien: ['viande', 'porc', 'volaille'],
  vegetarien: ['viande', 'porc', 'volaille', 'poisson', 'crustaces'],
  vegan: ['viande', 'porc', 'volaille', 'poisson', 'crustaces', 'oeuf', 'laitier'],
};

const MEAL_LABELS: Record<MealType, string> = {
  petit_dejeuner: 'Petit-déjeuner',
  dejeuner: 'Déjeuner',
  diner: 'Dîner',
  collation: 'Collation',
};

const CATEGORY_ORDER = [
  'Fruits et légumes',
  'Protéines',
  'Féculents et céréales',
  'Produits laitiers et alternatives',
  'Épicerie',
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
  return String(Math.round(value * 100) / 100).replace('.', ',');
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
  // Élision devant voyelle ou h muet (« d'huile »), mais pas devant y (« de yaourt »).
  const preposition = /^[aeiouhéèêœ]/i.test(ingredient.name) ? "d'" : 'de ';
  return `${amount} ${ingredient.unit} ${preposition}${ingredient.name}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Quantité d'achat, arrondie vers le haut pour ne jamais manquer. */
export function formatQuantity(amount: number, ingredient: Ingredient): string {
  if (ingredient.gramsPerPiece) return String(Math.ceil(amount / ingredient.gramsPerPiece - 1e-9));
  const rounded = Math.ceil(amount / 10) * 10;
  if (rounded >= 1000) return `${formatDecimal(rounded / 1000)} ${ingredient.unit === 'ml' ? 'L' : 'kg'}`;
  return `${rounded} ${ingredient.unit}`;
}

// Semaine de 7 jours avec 3 journées types en rotation : A, B, C, A, B, C, A.
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
  // Objectifs musculaires (au moins 25 % des calories en protéines) : on ne fait tourner que les
  // recettes les plus protéinées, et on ajoute une collation protéinée même à petit budget.
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
        `Aucune recette de ${MEAL_LABELS[type].toLowerCase()} ne correspond à vos restrictions : composez ce repas vous-même.`
      );
    }
  }

  const plannedDays = DAY_LETTERS.map((_, dayIndex) => {
    const recipes = slots.flatMap((type, slotIndex) => {
      const options = optionsFor(type);
      return options.length > 0 ? [options[(seed + dayIndex + slotIndex * 2) % options.length]] : [];
    });
    // Portions multipliées pour atteindre la cible calorique (dans une limite raisonnable).
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
      day_label: `Journée ${DAY_LETTERS[dayIndex]}`,
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
        CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.item.localeCompare(b.item, 'fr')
    );

  const averageProtein =
    plannedDays.reduce((total, meals) => total + nutritionOf(meals.flatMap((m) => m.portions)).protein, 0) /
    plannedDays.length;
  if (averageProtein < targets.proteinG * 0.8) {
    warnings.push(
      `Ces journées apportent environ ${Math.round(averageProtein)} g de protéines pour une cible de ${targets.proteinG} g : ajoutez si besoin une portion de tofu, de légumineuses ou de yaourt.`
    );
  }

  const usedIngredientIds = Array.from(totals.keys());
  if (
    profile.diet === 'halal' &&
    usedIngredientIds.some((id) => ['viande', 'volaille'].includes(INGREDIENTS[id].animal ?? ''))
  ) {
    warnings.push('Choisissez des viandes et volailles certifiées halal.');
  }

  if (profile.allergies?.trim()) {
    warnings.push(
      allergens.length > 0
        ? `Allergies exclues automatiquement : ${allergens.map((a) => ALLERGEN_LABELS[a]).join(', ')}. Si une autre allergie n'apparaît pas dans cette liste, vérifiez chaque recette et les étiquettes.`
        : "Votre allergie n'a pas pu être reconnue automatiquement : vérifiez chaque recette et les étiquettes."
    );
  }

  return { days, shoppingList, warnings, usedIngredientIds };
}

// --- Programme complet -----------------------------------------------------------------------

const STRATEGY_NOTES: Record<NutritionTargets['strategy'], string> = {
  deficit: 'Objectif : une perte progressive, avec un léger déficit calorique et des séances qui préservent vos muscles.',
  surplus: 'Objectif : une prise de masse progressive, avec un léger surplus calorique et des charges qui augmentent petit à petit.',
  maintien: 'Objectif : entretenir votre forme et votre énergie, sans restriction.',
};

const INTENSITY_NOTES: Record<Intensity, string> = {
  [-1]: 'Semaine allégée : une série de moins, pour récupérer sans culpabiliser.',
  0: 'On garde le même rythme cette semaine.',
  1: 'Belle semaine : une série de plus sur chaque exercice pour progresser.',
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

  const sessionsWord = profile.days_per_week > 1 ? 'séances' : 'séance';
  const notes = [
    STRATEGY_NOTES[targets.strategy],
    `${profile.days_per_week} ${sessionsWord} par semaine en ${splitFor(profile.days_per_week).name}.`,
  ];
  if (checkin) notes.push(INTENSITY_NOTES[intensity]);
  if (jointIssues.length > 0) {
    notes.push(
      `Vous avez signalé une gêne (${jointIssues.map((j) => JOINT_LABELS[j]).join(', ')}) : les exercices qui la sollicitent ont été retirés. Demandez l'avis d'un professionnel de santé avant de reprendre.`
    );
  } else if (profile.health_notes?.trim()) {
    notes.push('Vous avez indiqué une particularité de santé : faites valider ce programme par un professionnel avant de commencer.');
  }
  notes.push(...mealPlan.warnings);

  return {
    program,
    meals: mealPlan.days,
    shopping_list: mealPlan.shoppingList,
    coach_notes: notes.join(' '),
  };
}
