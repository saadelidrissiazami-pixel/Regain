// Average nutrition per 100 g (or 100 ml), for the food as it is weighed in the recipe — “dry”
// or “raw” appears in the name wherever it changes the calories a lot.
// Allergens and animal origin belong to the ingredient: whether a recipe suits a diet or an
// allergy is always derived from its ingredients, never typed in by hand.

export type Allergen =
  | 'gluten'
  | 'lactose'
  | 'oeufs'
  | 'arachides'
  | 'fruits_a_coque'
  | 'poisson'
  | 'crustaces'
  | 'soja'
  | 'sesame';

export type AnimalSource = 'viande' | 'porc' | 'volaille' | 'poisson' | 'crustaces' | 'oeuf' | 'laitier';

export type ShoppingCategory =
  | 'Fruit and vegetables'
  | 'Protein'
  | 'Grains and starches'
  | 'Dairy and alternatives'
  | 'Store cupboard';

export type Ingredient = {
  name: string;
  unit: 'g' | 'ml';
  kcalPer100: number;
  proteinPer100: number;
  category: ShoppingCategory;
  allergens: Allergen[];
  animal?: AnimalSource;
  /** Bought and cooked by the piece (eggs, bananas…): portions are rounded to whole pieces. */
  gramsPerPiece?: number;
  pieceLabel?: string;
  allowHalfPiece?: boolean;
};

const DATA = {
  flocons_avoine: { name: 'rolled oats', unit: 'g', kcalPer100: 370, proteinPer100: 13, category: 'Grains and starches', allergens: ['gluten'] },
  pain_complet: { name: 'wholemeal bread', unit: 'g', kcalPer100: 250, proteinPer100: 9, category: 'Grains and starches', allergens: ['gluten'] },
  tortilla: { name: 'wheat tortillas', unit: 'g', kcalPer100: 300, proteinPer100: 8, category: 'Grains and starches', allergens: ['gluten'], gramsPerPiece: 60, pieceLabel: 'tortilla' },
  pates_completes: { name: 'wholewheat pasta (dry)', unit: 'g', kcalPer100: 350, proteinPer100: 13, category: 'Grains and starches', allergens: ['gluten'] },
  riz_basmati: { name: 'basmati rice (dry)', unit: 'g', kcalPer100: 350, proteinPer100: 7.5, category: 'Grains and starches', allergens: [] },
  quinoa: { name: 'quinoa (dry)', unit: 'g', kcalPer100: 360, proteinPer100: 14, category: 'Grains and starches', allergens: [] },
  lentilles_corail: { name: 'red lentils (dry)', unit: 'g', kcalPer100: 340, proteinPer100: 24, category: 'Grains and starches', allergens: [] },
  pois_chiches: { name: 'cooked chickpeas', unit: 'g', kcalPer100: 140, proteinPer100: 7, category: 'Grains and starches', allergens: [] },

  lait_demi_ecreme: { name: 'semi-skimmed milk', unit: 'ml', kcalPer100: 46, proteinPer100: 3.3, category: 'Dairy and alternatives', allergens: ['lactose'], animal: 'laitier' },
  boisson_soja: { name: 'soya drink', unit: 'ml', kcalPer100: 40, proteinPer100: 3.3, category: 'Dairy and alternatives', allergens: ['soja'] },
  skyr: { name: 'plain skyr', unit: 'g', kcalPer100: 60, proteinPer100: 10, category: 'Dairy and alternatives', allergens: ['lactose'], animal: 'laitier' },
  yaourt_soja: { name: 'plain soya yoghurt', unit: 'g', kcalPer100: 50, proteinPer100: 4, category: 'Dairy and alternatives', allergens: ['soja'] },
  feta: { name: 'feta', unit: 'g', kcalPer100: 260, proteinPer100: 17, category: 'Dairy and alternatives', allergens: ['lactose'], animal: 'laitier' },
  mozzarella: { name: 'mozzarella', unit: 'g', kcalPer100: 250, proteinPer100: 18, category: 'Dairy and alternatives', allergens: ['lactose'], animal: 'laitier' },

  oeuf: { name: 'eggs', unit: 'g', kcalPer100: 140, proteinPer100: 12.5, category: 'Protein', allergens: ['oeufs'], animal: 'oeuf', gramsPerPiece: 60, pieceLabel: 'egg' },
  blanc_poulet: { name: 'chicken breast', unit: 'g', kcalPer100: 110, proteinPer100: 23, category: 'Protein', allergens: [], animal: 'volaille' },
  escalope_dinde: { name: 'turkey escalope', unit: 'g', kcalPer100: 105, proteinPer100: 23, category: 'Protein', allergens: [], animal: 'volaille' },
  boeuf_hache: { name: 'lean beef mince (5%)', unit: 'g', kcalPer100: 125, proteinPer100: 21, category: 'Protein', allergens: [], animal: 'viande' },
  saumon: { name: 'salmon fillet', unit: 'g', kcalPer100: 200, proteinPer100: 20, category: 'Protein', allergens: ['poisson'], animal: 'poisson' },
  cabillaud: { name: 'cod fillet', unit: 'g', kcalPer100: 80, proteinPer100: 18, category: 'Protein', allergens: ['poisson'], animal: 'poisson' },
  thon: { name: 'tuna in water', unit: 'g', kcalPer100: 110, proteinPer100: 25, category: 'Protein', allergens: ['poisson'], animal: 'poisson' },
  tofu: { name: 'firm tofu', unit: 'g', kcalPer100: 130, proteinPer100: 13, category: 'Protein', allergens: ['soja'] },

  banane: { name: 'bananas', unit: 'g', kcalPer100: 90, proteinPer100: 1.1, category: 'Fruit and vegetables', allergens: [], gramsPerPiece: 120, pieceLabel: 'banana' },
  pomme: { name: 'apples', unit: 'g', kcalPer100: 52, proteinPer100: 0.3, category: 'Fruit and vegetables', allergens: [], gramsPerPiece: 150, pieceLabel: 'apple' },
  avocat: { name: 'avocados', unit: 'g', kcalPer100: 160, proteinPer100: 2, category: 'Fruit and vegetables', allergens: [], gramsPerPiece: 150, pieceLabel: 'avocado', allowHalfPiece: true },
  fruits_rouges: { name: 'berries (fresh or frozen)', unit: 'g', kcalPer100: 45, proteinPer100: 1, category: 'Fruit and vegetables', allergens: [] },
  pomme_de_terre: { name: 'potatoes', unit: 'g', kcalPer100: 77, proteinPer100: 2, category: 'Fruit and vegetables', allergens: [] },
  patate_douce: { name: 'sweet potatoes', unit: 'g', kcalPer100: 86, proteinPer100: 1.6, category: 'Fruit and vegetables', allergens: [] },
  brocoli: { name: 'broccoli', unit: 'g', kcalPer100: 34, proteinPer100: 2.8, category: 'Fruit and vegetables', allergens: [] },
  courgette: { name: 'courgettes', unit: 'g', kcalPer100: 17, proteinPer100: 1.2, category: 'Fruit and vegetables', allergens: [] },
  epinards: { name: 'spinach (fresh or frozen)', unit: 'g', kcalPer100: 23, proteinPer100: 2.9, category: 'Fruit and vegetables', allergens: [] },
  tomate: { name: 'tomatoes', unit: 'g', kcalPer100: 18, proteinPer100: 0.9, category: 'Fruit and vegetables', allergens: [] },
  carotte: { name: 'carrots', unit: 'g', kcalPer100: 41, proteinPer100: 0.9, category: 'Fruit and vegetables', allergens: [] },
  poivron: { name: 'peppers', unit: 'g', kcalPer100: 26, proteinPer100: 1, category: 'Fruit and vegetables', allergens: [] },
  salade: { name: 'green salad', unit: 'g', kcalPer100: 15, proteinPer100: 1.4, category: 'Fruit and vegetables', allergens: [] },
  concombre: { name: 'cucumber', unit: 'g', kcalPer100: 15, proteinPer100: 0.7, category: 'Fruit and vegetables', allergens: [] },
  oignon: { name: 'onions', unit: 'g', kcalPer100: 40, proteinPer100: 1.1, category: 'Fruit and vegetables', allergens: [] },

  sauce_tomate: { name: 'passata', unit: 'g', kcalPer100: 40, proteinPer100: 1.5, category: 'Store cupboard', allergens: [] },
  lait_coco: { name: 'coconut milk (cooking)', unit: 'ml', kcalPer100: 180, proteinPer100: 2, category: 'Store cupboard', allergens: [] },
  houmous: { name: 'hummus', unit: 'g', kcalPer100: 300, proteinPer100: 8, category: 'Store cupboard', allergens: ['sesame'] },
  amandes: { name: 'almonds', unit: 'g', kcalPer100: 600, proteinPer100: 21, category: 'Store cupboard', allergens: ['fruits_a_coque'] },
  beurre_cacahuete: { name: 'peanut butter', unit: 'g', kcalPer100: 590, proteinPer100: 25, category: 'Store cupboard', allergens: ['arachides'] },
  huile_olive: { name: 'olive oil', unit: 'ml', kcalPer100: 820, proteinPer100: 0, category: 'Store cupboard', allergens: [] },
} satisfies Record<string, Ingredient>;

export type IngredientId = keyof typeof DATA;

export const INGREDIENTS: Record<IngredientId, Ingredient> = DATA;
