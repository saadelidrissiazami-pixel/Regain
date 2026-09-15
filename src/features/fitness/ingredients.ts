// Valeurs nutritionnelles moyennes pour 100 g (ou 100 ml), aliment tel qu'il est pesé dans la
// recette (« cru » / « sec » précisé dans le nom quand ça change beaucoup les calories).
// Allergènes et origine animale sont portés par l'ingrédient : la compatibilité d'une recette
// avec un régime ou une allergie est toujours déduite de ses ingrédients, jamais saisie à la main.

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
  | 'Fruits et légumes'
  | 'Protéines'
  | 'Féculents et céréales'
  | 'Produits laitiers et alternatives'
  | 'Épicerie';

export type Ingredient = {
  name: string;
  unit: 'g' | 'ml';
  kcalPer100: number;
  proteinPer100: number;
  category: ShoppingCategory;
  allergens: Allergen[];
  animal?: AnimalSource;
  /** Acheté et cuisiné à la pièce (œufs, bananes…) : les portions sont arrondies à la pièce. */
  gramsPerPiece?: number;
  pieceLabel?: string;
  allowHalfPiece?: boolean;
};

const DATA = {
  flocons_avoine: { name: "flocons d'avoine", unit: 'g', kcalPer100: 370, proteinPer100: 13, category: 'Féculents et céréales', allergens: ['gluten'] },
  pain_complet: { name: 'pain complet', unit: 'g', kcalPer100: 250, proteinPer100: 9, category: 'Féculents et céréales', allergens: ['gluten'] },
  tortilla: { name: 'tortillas de blé', unit: 'g', kcalPer100: 300, proteinPer100: 8, category: 'Féculents et céréales', allergens: ['gluten'], gramsPerPiece: 60, pieceLabel: 'tortilla' },
  pates_completes: { name: 'pâtes complètes (crues)', unit: 'g', kcalPer100: 350, proteinPer100: 13, category: 'Féculents et céréales', allergens: ['gluten'] },
  riz_basmati: { name: 'riz basmati (cru)', unit: 'g', kcalPer100: 350, proteinPer100: 7.5, category: 'Féculents et céréales', allergens: [] },
  quinoa: { name: 'quinoa (cru)', unit: 'g', kcalPer100: 360, proteinPer100: 14, category: 'Féculents et céréales', allergens: [] },
  lentilles_corail: { name: 'lentilles corail (sèches)', unit: 'g', kcalPer100: 340, proteinPer100: 24, category: 'Féculents et céréales', allergens: [] },
  pois_chiches: { name: 'pois chiches cuits', unit: 'g', kcalPer100: 140, proteinPer100: 7, category: 'Féculents et céréales', allergens: [] },

  lait_demi_ecreme: { name: 'lait demi-écrémé', unit: 'ml', kcalPer100: 46, proteinPer100: 3.3, category: 'Produits laitiers et alternatives', allergens: ['lactose'], animal: 'laitier' },
  boisson_soja: { name: 'boisson au soja', unit: 'ml', kcalPer100: 40, proteinPer100: 3.3, category: 'Produits laitiers et alternatives', allergens: ['soja'] },
  skyr: { name: 'skyr nature', unit: 'g', kcalPer100: 60, proteinPer100: 10, category: 'Produits laitiers et alternatives', allergens: ['lactose'], animal: 'laitier' },
  yaourt_soja: { name: 'yaourt au soja nature', unit: 'g', kcalPer100: 50, proteinPer100: 4, category: 'Produits laitiers et alternatives', allergens: ['soja'] },
  feta: { name: 'feta', unit: 'g', kcalPer100: 260, proteinPer100: 17, category: 'Produits laitiers et alternatives', allergens: ['lactose'], animal: 'laitier' },
  mozzarella: { name: 'mozzarella', unit: 'g', kcalPer100: 250, proteinPer100: 18, category: 'Produits laitiers et alternatives', allergens: ['lactose'], animal: 'laitier' },

  oeuf: { name: 'œufs', unit: 'g', kcalPer100: 140, proteinPer100: 12.5, category: 'Protéines', allergens: ['oeufs'], animal: 'oeuf', gramsPerPiece: 60, pieceLabel: 'œuf' },
  blanc_poulet: { name: 'blanc de poulet', unit: 'g', kcalPer100: 110, proteinPer100: 23, category: 'Protéines', allergens: [], animal: 'volaille' },
  escalope_dinde: { name: 'escalope de dinde', unit: 'g', kcalPer100: 105, proteinPer100: 23, category: 'Protéines', allergens: [], animal: 'volaille' },
  boeuf_hache: { name: 'bœuf haché 5 %', unit: 'g', kcalPer100: 125, proteinPer100: 21, category: 'Protéines', allergens: [], animal: 'viande' },
  saumon: { name: 'pavé de saumon', unit: 'g', kcalPer100: 200, proteinPer100: 20, category: 'Protéines', allergens: ['poisson'], animal: 'poisson' },
  cabillaud: { name: 'dos de cabillaud', unit: 'g', kcalPer100: 80, proteinPer100: 18, category: 'Protéines', allergens: ['poisson'], animal: 'poisson' },
  thon: { name: 'thon au naturel', unit: 'g', kcalPer100: 110, proteinPer100: 25, category: 'Protéines', allergens: ['poisson'], animal: 'poisson' },
  tofu: { name: 'tofu ferme', unit: 'g', kcalPer100: 130, proteinPer100: 13, category: 'Protéines', allergens: ['soja'] },

  banane: { name: 'bananes', unit: 'g', kcalPer100: 90, proteinPer100: 1.1, category: 'Fruits et légumes', allergens: [], gramsPerPiece: 120, pieceLabel: 'banane' },
  pomme: { name: 'pommes', unit: 'g', kcalPer100: 52, proteinPer100: 0.3, category: 'Fruits et légumes', allergens: [], gramsPerPiece: 150, pieceLabel: 'pomme' },
  avocat: { name: 'avocats', unit: 'g', kcalPer100: 160, proteinPer100: 2, category: 'Fruits et légumes', allergens: [], gramsPerPiece: 150, pieceLabel: 'avocat', allowHalfPiece: true },
  fruits_rouges: { name: 'fruits rouges (frais ou surgelés)', unit: 'g', kcalPer100: 45, proteinPer100: 1, category: 'Fruits et légumes', allergens: [] },
  pomme_de_terre: { name: 'pommes de terre', unit: 'g', kcalPer100: 77, proteinPer100: 2, category: 'Fruits et légumes', allergens: [] },
  patate_douce: { name: 'patates douces', unit: 'g', kcalPer100: 86, proteinPer100: 1.6, category: 'Fruits et légumes', allergens: [] },
  brocoli: { name: 'brocoli', unit: 'g', kcalPer100: 34, proteinPer100: 2.8, category: 'Fruits et légumes', allergens: [] },
  courgette: { name: 'courgettes', unit: 'g', kcalPer100: 17, proteinPer100: 1.2, category: 'Fruits et légumes', allergens: [] },
  epinards: { name: 'épinards (frais ou surgelés)', unit: 'g', kcalPer100: 23, proteinPer100: 2.9, category: 'Fruits et légumes', allergens: [] },
  tomate: { name: 'tomates', unit: 'g', kcalPer100: 18, proteinPer100: 0.9, category: 'Fruits et légumes', allergens: [] },
  carotte: { name: 'carottes', unit: 'g', kcalPer100: 41, proteinPer100: 0.9, category: 'Fruits et légumes', allergens: [] },
  poivron: { name: 'poivrons', unit: 'g', kcalPer100: 26, proteinPer100: 1, category: 'Fruits et légumes', allergens: [] },
  salade: { name: 'salade verte', unit: 'g', kcalPer100: 15, proteinPer100: 1.4, category: 'Fruits et légumes', allergens: [] },
  concombre: { name: 'concombre', unit: 'g', kcalPer100: 15, proteinPer100: 0.7, category: 'Fruits et légumes', allergens: [] },
  oignon: { name: 'oignons', unit: 'g', kcalPer100: 40, proteinPer100: 1.1, category: 'Fruits et légumes', allergens: [] },

  sauce_tomate: { name: 'coulis de tomate', unit: 'g', kcalPer100: 40, proteinPer100: 1.5, category: 'Épicerie', allergens: [] },
  lait_coco: { name: 'lait de coco (cuisine)', unit: 'ml', kcalPer100: 180, proteinPer100: 2, category: 'Épicerie', allergens: [] },
  houmous: { name: 'houmous', unit: 'g', kcalPer100: 300, proteinPer100: 8, category: 'Épicerie', allergens: ['sesame'] },
  amandes: { name: 'amandes', unit: 'g', kcalPer100: 600, proteinPer100: 21, category: 'Épicerie', allergens: ['fruits_a_coque'] },
  beurre_cacahuete: { name: 'beurre de cacahuète', unit: 'g', kcalPer100: 590, proteinPer100: 25, category: 'Épicerie', allergens: ['arachides'] },
  huile_olive: { name: "huile d'olive", unit: 'ml', kcalPer100: 820, proteinPer100: 0, category: 'Épicerie', allergens: [] },
} satisfies Record<string, Ingredient>;

export type IngredientId = keyof typeof DATA;

export const INGREDIENTS: Record<IngredientId, Ingredient> = DATA;
