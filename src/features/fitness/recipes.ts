import type { IngredientId } from './ingredients';

export type MealType = 'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation';

export type Recipe = {
  id: string;
  name: string;
  mealType: MealType;
  /** Portion de base, en grammes ou millilitres selon l'unité de l'ingrédient. */
  ingredients: { id: IngredientId; amount: number }[];
};

// Portions de base (~400-600 kcal par repas) : le générateur les multiplie ensuite pour que
// chaque journée atteigne la cible calorique de la personne.
export const RECIPES: Recipe[] = [
  {
    id: 'pdj_porridge_banane',
    name: 'Porridge à la banane',
    mealType: 'petit_dejeuner',
    ingredients: [
      { id: 'flocons_avoine', amount: 60 },
      { id: 'lait_demi_ecreme', amount: 250 },
      { id: 'banane', amount: 120 },
    ],
  },
  {
    id: 'pdj_porridge_soja',
    name: 'Porridge soja et fruits rouges',
    mealType: 'petit_dejeuner',
    ingredients: [
      { id: 'flocons_avoine', amount: 60 },
      { id: 'boisson_soja', amount: 250 },
      { id: 'fruits_rouges', amount: 100 },
      { id: 'amandes', amount: 15 },
    ],
  },
  {
    id: 'pdj_omelette_pain',
    name: 'Omelette et tartine complète',
    mealType: 'petit_dejeuner',
    ingredients: [
      { id: 'oeuf', amount: 120 },
      { id: 'pain_complet', amount: 60 },
      { id: 'tomate', amount: 100 },
      { id: 'huile_olive', amount: 5 },
    ],
  },
  {
    id: 'pdj_skyr_bowl',
    name: 'Bol de skyr, fruits rouges et amandes',
    mealType: 'petit_dejeuner',
    ingredients: [
      { id: 'skyr', amount: 200 },
      { id: 'fruits_rouges', amount: 125 },
      { id: 'banane', amount: 120 },
      { id: 'amandes', amount: 20 },
    ],
  },
  {
    id: 'pdj_tartines_cacahuete',
    name: 'Tartines beurre de cacahuète et banane',
    mealType: 'petit_dejeuner',
    ingredients: [
      { id: 'pain_complet', amount: 80 },
      { id: 'beurre_cacahuete', amount: 20 },
      { id: 'banane', amount: 120 },
    ],
  },
  {
    id: 'pdj_yaourt_soja_pomme',
    name: "Yaourt soja, pomme et flocons d'avoine",
    mealType: 'petit_dejeuner',
    ingredients: [
      { id: 'yaourt_soja', amount: 250 },
      { id: 'pomme', amount: 150 },
      { id: 'flocons_avoine', amount: 40 },
    ],
  },
  {
    id: 'pdj_oeufs_avocat',
    name: 'Œufs brouillés, avocat et tomates',
    mealType: 'petit_dejeuner',
    ingredients: [
      { id: 'oeuf', amount: 180 },
      { id: 'avocat', amount: 75 },
      { id: 'tomate', amount: 150 },
      { id: 'huile_olive', amount: 5 },
    ],
  },
  {
    id: 'pdj_bol_soja_fruits',
    name: 'Bol yaourt soja, banane et fruits rouges',
    mealType: 'petit_dejeuner',
    ingredients: [
      { id: 'yaourt_soja', amount: 250 },
      { id: 'banane', amount: 120 },
      { id: 'fruits_rouges', amount: 125 },
      { id: 'amandes', amount: 15 },
    ],
  },

  {
    id: 'dej_poulet_riz',
    name: 'Poulet, riz basmati et brocoli',
    mealType: 'dejeuner',
    ingredients: [
      { id: 'blanc_poulet', amount: 130 },
      { id: 'riz_basmati', amount: 75 },
      { id: 'brocoli', amount: 150 },
      { id: 'huile_olive', amount: 10 },
    ],
  },
  {
    id: 'dej_bowl_quinoa',
    name: 'Bowl quinoa, pois chiches et crudités',
    mealType: 'dejeuner',
    ingredients: [
      { id: 'quinoa', amount: 70 },
      { id: 'pois_chiches', amount: 150 },
      { id: 'concombre', amount: 100 },
      { id: 'tomate', amount: 100 },
      { id: 'huile_olive', amount: 10 },
    ],
  },
  {
    id: 'dej_saumon_patate',
    name: 'Saumon, patate douce et épinards',
    mealType: 'dejeuner',
    ingredients: [
      { id: 'saumon', amount: 120 },
      { id: 'patate_douce', amount: 200 },
      { id: 'epinards', amount: 100 },
      { id: 'huile_olive', amount: 5 },
    ],
  },
  {
    id: 'dej_pates_thon',
    name: 'Pâtes complètes au thon et à la tomate',
    mealType: 'dejeuner',
    ingredients: [
      { id: 'pates_completes', amount: 80 },
      { id: 'thon', amount: 100 },
      { id: 'sauce_tomate', amount: 100 },
      { id: 'huile_olive', amount: 5 },
    ],
  },
  {
    id: 'dej_wrap_dinde',
    name: 'Wrap dinde, houmous et crudités',
    mealType: 'dejeuner',
    ingredients: [
      { id: 'tortilla', amount: 60 },
      { id: 'escalope_dinde', amount: 110 },
      { id: 'salade', amount: 30 },
      { id: 'tomate', amount: 80 },
      { id: 'houmous', amount: 30 },
    ],
  },
  {
    id: 'dej_dahl',
    name: 'Dahl de lentilles corail et riz',
    mealType: 'dejeuner',
    ingredients: [
      { id: 'lentilles_corail', amount: 70 },
      { id: 'riz_basmati', amount: 50 },
      { id: 'lait_coco', amount: 50 },
      { id: 'tomate', amount: 100 },
      { id: 'oignon', amount: 50 },
    ],
  },
  {
    id: 'dej_salade_feta',
    name: 'Salade de quinoa, pois chiches et feta',
    mealType: 'dejeuner',
    ingredients: [
      { id: 'quinoa', amount: 60 },
      { id: 'pois_chiches', amount: 120 },
      { id: 'feta', amount: 40 },
      { id: 'salade', amount: 50 },
      { id: 'tomate', amount: 100 },
      { id: 'huile_olive', amount: 10 },
    ],
  },

  {
    id: 'din_tofu_legumes',
    name: 'Tofu sauté, légumes et riz',
    mealType: 'diner',
    ingredients: [
      { id: 'tofu', amount: 150 },
      { id: 'poivron', amount: 100 },
      { id: 'courgette', amount: 100 },
      { id: 'riz_basmati', amount: 60 },
      { id: 'huile_olive', amount: 10 },
    ],
  },
  {
    id: 'din_cabillaud',
    name: 'Cabillaud, pommes de terre et brocoli',
    mealType: 'diner',
    ingredients: [
      { id: 'cabillaud', amount: 150 },
      { id: 'pomme_de_terre', amount: 250 },
      { id: 'brocoli', amount: 150 },
      { id: 'huile_olive', amount: 10 },
    ],
  },
  {
    id: 'din_boeuf_patate',
    name: 'Bœuf haché, patate douce et courgettes',
    mealType: 'diner',
    ingredients: [
      { id: 'boeuf_hache', amount: 120 },
      { id: 'patate_douce', amount: 200 },
      { id: 'courgette', amount: 150 },
      { id: 'huile_olive', amount: 5 },
    ],
  },
  {
    id: 'din_omelette_epinards',
    name: 'Omelette aux épinards et pommes de terre',
    mealType: 'diner',
    ingredients: [
      { id: 'oeuf', amount: 180 },
      { id: 'epinards', amount: 100 },
      { id: 'pomme_de_terre', amount: 200 },
      { id: 'huile_olive', amount: 5 },
    ],
  },
  {
    id: 'din_curry_pois_chiches',
    name: 'Curry de pois chiches aux épinards',
    mealType: 'diner',
    ingredients: [
      { id: 'pois_chiches', amount: 200 },
      { id: 'epinards', amount: 100 },
      { id: 'lait_coco', amount: 60 },
      { id: 'riz_basmati', amount: 50 },
      { id: 'oignon', amount: 50 },
    ],
  },
  {
    id: 'din_poulet_quinoa',
    name: 'Poulet, quinoa et légumes rôtis',
    mealType: 'diner',
    ingredients: [
      { id: 'blanc_poulet', amount: 130 },
      { id: 'quinoa', amount: 60 },
      { id: 'poivron', amount: 100 },
      { id: 'courgette', amount: 100 },
      { id: 'huile_olive', amount: 10 },
    ],
  },
  {
    id: 'din_pates_mozza',
    name: 'Pâtes complètes tomate, mozzarella et épinards',
    mealType: 'diner',
    ingredients: [
      { id: 'pates_completes', amount: 80 },
      { id: 'sauce_tomate', amount: 120 },
      { id: 'mozzarella', amount: 60 },
      { id: 'epinards', amount: 80 },
    ],
  },

  {
    id: 'col_skyr',
    name: 'Skyr et fruits rouges',
    mealType: 'collation',
    ingredients: [
      { id: 'skyr', amount: 150 },
      { id: 'fruits_rouges', amount: 80 },
    ],
  },
  {
    id: 'col_pomme_amandes',
    name: 'Pomme et amandes',
    mealType: 'collation',
    ingredients: [
      { id: 'pomme', amount: 150 },
      { id: 'amandes', amount: 20 },
    ],
  },
  {
    id: 'col_houmous_carottes',
    name: 'Houmous et bâtonnets de carotte',
    mealType: 'collation',
    ingredients: [
      { id: 'houmous', amount: 50 },
      { id: 'carotte', amount: 150 },
    ],
  },
  {
    id: 'col_banane_cacahuete',
    name: 'Banane et beurre de cacahuète',
    mealType: 'collation',
    ingredients: [
      { id: 'banane', amount: 120 },
      { id: 'beurre_cacahuete', amount: 15 },
    ],
  },
  {
    id: 'col_yaourt_soja_banane',
    name: 'Yaourt soja et banane',
    mealType: 'collation',
    ingredients: [
      { id: 'yaourt_soja', amount: 125 },
      { id: 'banane', amount: 120 },
    ],
  },
  {
    id: 'col_oeufs_durs',
    name: 'Œufs durs et tomates cerises',
    mealType: 'collation',
    ingredients: [
      { id: 'oeuf', amount: 120 },
      { id: 'tomate', amount: 100 },
    ],
  },
];
