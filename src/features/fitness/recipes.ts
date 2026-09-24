import type { IngredientId } from './ingredients';
import { t } from '../../lib/i18n';

export type MealType = 'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation';

export type Recipe = {
  id: string;
  name: string;
  mealType: MealType;
  /** The base portion, in grams or millilitres depending on the ingredient's unit. */
  ingredients: { id: IngredientId; amount: number }[];
};

// Base portions (~400-600 kcal per meal): the generator then scales them so that each day
// reaches the person's calorie target.
export const RECIPES: Recipe[] = [
  {
    id: 'pdj_porridge_banane',
    name: t('Banana porridge'),
    mealType: 'petit_dejeuner',
    ingredients: [
      { id: 'flocons_avoine', amount: 60 },
      { id: 'lait_demi_ecreme', amount: 250 },
      { id: 'banane', amount: 120 },
    ],
  },
  {
    id: 'pdj_porridge_soja',
    name: t('Soya porridge with berries'),
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
    name: t('Omelette with wholemeal toast'),
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
    name: t('Skyr bowl with berries and almonds'),
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
    name: t('Peanut butter and banana on toast'),
    mealType: 'petit_dejeuner',
    ingredients: [
      { id: 'pain_complet', amount: 80 },
      { id: 'beurre_cacahuete', amount: 20 },
      { id: 'banane', amount: 120 },
    ],
  },
  {
    id: 'pdj_yaourt_soja_pomme',
    name: t('Soya yoghurt, apple and oats'),
    mealType: 'petit_dejeuner',
    ingredients: [
      { id: 'yaourt_soja', amount: 250 },
      { id: 'pomme', amount: 150 },
      { id: 'flocons_avoine', amount: 40 },
    ],
  },
  {
    id: 'pdj_oeufs_avocat',
    name: t('Scrambled eggs, avocado and tomatoes'),
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
    name: t('Soya yoghurt bowl with banana and berries'),
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
    name: t('Chicken, basmati rice and broccoli'),
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
    name: t('Quinoa and chickpea bowl with raw vegetables'),
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
    name: t('Salmon, sweet potato and spinach'),
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
    name: t('Wholewheat pasta with tuna and tomato'),
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
    name: t('Turkey wrap with hummus and salad'),
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
    name: t('Red lentil dhal with rice'),
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
    name: t('Quinoa, chickpea and feta salad'),
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
    name: t('Stir-fried tofu with vegetables and rice'),
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
    name: t('Cod, potatoes and broccoli'),
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
    name: t('Beef mince, sweet potato and courgettes'),
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
    name: t('Spinach omelette with potatoes'),
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
    name: t('Chickpea and spinach curry'),
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
    name: t('Chicken, quinoa and roast vegetables'),
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
    name: t('Wholewheat pasta with tomato, mozzarella and spinach'),
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
    name: t('Skyr and berries'),
    mealType: 'collation',
    ingredients: [
      { id: 'skyr', amount: 150 },
      { id: 'fruits_rouges', amount: 80 },
    ],
  },
  {
    id: 'col_pomme_amandes',
    name: t('Apple and almonds'),
    mealType: 'collation',
    ingredients: [
      { id: 'pomme', amount: 150 },
      { id: 'amandes', amount: 20 },
    ],
  },
  {
    id: 'col_houmous_carottes',
    name: t('Hummus and carrot sticks'),
    mealType: 'collation',
    ingredients: [
      { id: 'houmous', amount: 50 },
      { id: 'carotte', amount: 150 },
    ],
  },
  {
    id: 'col_banane_cacahuete',
    name: t('Banana and peanut butter'),
    mealType: 'collation',
    ingredients: [
      { id: 'banane', amount: 120 },
      { id: 'beurre_cacahuete', amount: 15 },
    ],
  },
  {
    id: 'col_yaourt_soja_banane',
    name: t('Soya yoghurt and banana'),
    mealType: 'collation',
    ingredients: [
      { id: 'yaourt_soja', amount: 125 },
      { id: 'banane', amount: 120 },
    ],
  },
  {
    id: 'col_oeufs_durs',
    name: t('Boiled eggs and cherry tomatoes'),
    mealType: 'collation',
    ingredients: [
      { id: 'oeuf', amount: 120 },
      { id: 'tomate', amount: 100 },
    ],
  },
];
