import { lang, t } from '../../lib/i18n';
import { slugify } from './exercises';

/**
 * The foods somebody can pick instead of typing four numbers they do not know.
 *
 * Asking for carbohydrate and fat as well as calories only works if the app answers the question
 * it just asked. Nobody knows that cooked lentils are 20 g of carbohydrate per 100 g, so the
 * person names the food, says roughly how much, and the four numbers follow.
 *
 * Why a table in the bundle rather than a lookup service: a meal gets noted on a train, in a
 * canteen, at a table — the places with the worst signal. An offline table answers instantly and
 * cannot go down. It is not exhaustive, and it does not try to be: what is here is the food people
 * actually eat every day, and the photo estimate covers the rest.
 *
 * Both names are stored on the row rather than passed through t(). Two reasons: a dictionary entry
 * per food would double this file's length in another file, and search then matches either
 * language — somebody typing "chicken" on a French phone still finds "blanc de poulet".
 *
 * The figures are per 100 g (per 100 ml where the unit says so), rounded to the precision a food
 * table can honestly claim, and taken from the usual composition references (CIQUAL for French
 * foods, USDA otherwise). They are averages: two apples differ, a restaurant's lasagne differs
 * from a supermarket's. tests/foods.test.ts checks every row against the energy its own
 * macronutrients imply, which is what catches a mistyped digit.
 *
 * Carbohydrate is the available carbohydrate, excluding fibre, which is what a European label
 * shows — not the American total. On a leafy vegetable the difference is most of the figure.
 */

export type FoodCategory =
  | 'fruits'
  | 'vegetables'
  | 'grains'
  | 'pulses'
  | 'meat'
  | 'fish'
  | 'dairy'
  | 'plant-protein'
  | 'fats'
  | 'dishes'
  | 'drinks'
  | 'sweets'
  | 'pantry';

/** Per 100 g or 100 ml, then the size of one ordinary helping in the same unit. */
type Row = [
  fr: string,
  en: string,
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
  portion: number,
  unit?: 'ml',
];

export const FOOD_CATEGORIES: Record<FoodCategory, { fr: string; en: string }> = {
  fruits: { fr: 'Fruits', en: 'Fruit' },
  vegetables: { fr: 'Légumes', en: 'Vegetables' },
  grains: { fr: 'Féculents et céréales', en: 'Grains and starches' },
  pulses: { fr: 'Légumineuses', en: 'Pulses' },
  meat: { fr: 'Viandes et volailles', en: 'Meat and poultry' },
  fish: { fr: 'Poissons et fruits de mer', en: 'Fish and seafood' },
  dairy: { fr: 'Œufs et produits laitiers', en: 'Eggs and dairy' },
  'plant-protein': { fr: 'Protéines végétales', en: 'Plant protein' },
  fats: { fr: 'Matières grasses et oléagineux', en: 'Fats and nuts' },
  dishes: { fr: 'Plats et sandwichs', en: 'Dishes and sandwiches' },
  drinks: { fr: 'Boissons', en: 'Drinks' },
  sweets: { fr: 'Sucré et snacks', en: 'Sweet things and snacks' },
  pantry: { fr: 'Épicerie et sauces', en: 'Store cupboard and sauces' },
};

// Cooked or raw is part of the name wherever it changes the numbers several-fold: 100 g of dry
// pasta is not 100 g of pasta on a plate, and that single confusion is the biggest error anyone
// makes noting a meal.
const DATA: Record<FoodCategory, Row[]> = {
  fruits: [
    ['Pomme', 'Apple', 52, 0.3, 14, 0.2, 150],
    ['Banane', 'Banana', 89, 1.1, 23, 0.3, 120],
    ['Orange', 'Orange', 47, 0.9, 12, 0.1, 180],
    ['Clémentine', 'Clementine', 47, 0.9, 12, 0.2, 70],
    ['Fraises', 'Strawberries', 33, 0.7, 8, 0.3, 150],
    ['Framboises', 'Raspberries', 52, 1.2, 12, 0.7, 125],
    ['Myrtilles', 'Blueberries', 57, 0.7, 14, 0.3, 125],
    ['Raisin', 'Grapes', 69, 0.7, 18, 0.2, 125],
    ['Poire', 'Pear', 57, 0.4, 15, 0.1, 170],
    ['Pêche', 'Peach', 39, 0.9, 10, 0.3, 150],
    ['Abricot', 'Apricot', 48, 1.4, 11, 0.4, 60],
    ['Prune', 'Plum', 46, 0.7, 11, 0.3, 70],
    ['Cerises', 'Cherries', 63, 1.1, 16, 0.2, 125],
    ['Melon', 'Melon', 34, 0.8, 8, 0.2, 200],
    ['Pastèque', 'Watermelon', 30, 0.6, 8, 0.2, 200],
    ['Ananas', 'Pineapple', 50, 0.5, 13, 0.1, 150],
    ['Mangue', 'Mango', 60, 0.8, 15, 0.4, 150],
    ['Kiwi', 'Kiwi', 61, 1.1, 15, 0.5, 80],
    ['Pamplemousse', 'Grapefruit', 42, 0.8, 11, 0.1, 200],
    ['Avocat', 'Avocado', 160, 2, 9, 15, 100],
    ['Figue', 'Fig', 74, 0.8, 19, 0.3, 60],
    ['Grenade', 'Pomegranate', 83, 1.7, 19, 1.2, 150],
    ['Dattes', 'Dates', 282, 2.5, 75, 0.4, 30],
    ['Raisins secs', 'Raisins', 299, 3.1, 79, 0.5, 30],
    ['Abricots secs', 'Dried apricots', 241, 3.4, 63, 0.5, 30],
    ['Pruneaux', 'Prunes', 240, 2.2, 64, 0.4, 30],
    ['Compote de pommes sans sucre', 'Unsweetened apple purée', 50, 0.2, 12, 0.1, 100],
  ],
  vegetables: [
    ['Tomate', 'Tomato', 18, 0.9, 3.9, 0.2, 120],
    ['Carotte', 'Carrot', 41, 0.9, 10, 0.2, 100],
    ['Courgette', 'Courgette', 17, 1.2, 3.1, 0.3, 150],
    ['Aubergine', 'Aubergine', 25, 1, 6, 0.2, 150],
    ['Poivron', 'Pepper', 26, 1, 6, 0.3, 120],
    ['Concombre', 'Cucumber', 15, 0.7, 3.6, 0.1, 100],
    ['Salade verte', 'Green salad', 15, 1.4, 2.9, 0.2, 60],
    ['Roquette', 'Rocket', 25, 2.6, 2, 0.7, 40],
    ['Épinards', 'Spinach', 23, 2.9, 1.4, 0.4, 150],
    ['Brocoli', 'Broccoli', 34, 2.8, 4, 0.4, 150],
    ['Chou-fleur', 'Cauliflower', 25, 1.9, 5, 0.3, 150],
    ['Chou', 'Cabbage', 25, 1.3, 6, 0.1, 150],
    ['Haricots verts', 'Green beans', 31, 1.8, 7, 0.1, 150],
    ['Petits pois', 'Peas', 81, 5.4, 14, 0.4, 120],
    ['Courge butternut', 'Butternut squash', 45, 1, 12, 0.1, 150],
    ['Champignons de Paris', 'Button mushrooms', 22, 3.1, 2, 0.3, 100],
    ['Oignon', 'Onion', 40, 1.1, 9, 0.1, 60],
    ['Ail', 'Garlic', 149, 6.4, 33, 0.5, 5],
    ['Poireau', 'Leek', 61, 1.5, 14, 0.3, 120],
    ['Betterave', 'Beetroot', 43, 1.6, 10, 0.2, 100],
    ['Radis', 'Radish', 16, 0.7, 3.4, 0.1, 60],
    ['Asperges', 'Asparagus', 20, 2.2, 2, 0.1, 150],
    ['Artichaut', 'Artichoke', 47, 3.3, 6.5, 0.2, 120],
    ['Maïs', 'Sweetcorn', 86, 3.3, 19, 1.2, 100],
    ['Endive', 'Chicory', 17, 0.9, 3.4, 0.1, 100],
    ['Fenouil', 'Fennel', 31, 1.2, 7, 0.2, 150],
    ['Potiron', 'Pumpkin', 26, 1, 4.5, 0.1, 150],
    ['Olives vertes', 'Green olives', 145, 1, 4, 15, 30],
    ['Olives noires', 'Black olives', 165, 1.2, 4.6, 16, 30],
  ],
  grains: [
    ['Riz blanc cuit', 'White rice (cooked)', 130, 2.7, 28, 0.3, 200],
    ['Riz complet cuit', 'Brown rice (cooked)', 112, 2.6, 23, 0.9, 200],
    ['Riz basmati cru', 'Basmati rice (dry)', 350, 7.5, 78, 0.9, 80],
    ['Pâtes cuites', 'Pasta (cooked)', 131, 5, 25, 1.1, 200],
    ['Pâtes complètes cuites', 'Wholewheat pasta (cooked)', 124, 5, 25, 1.4, 200],
    ['Pâtes crues', 'Pasta (dry)', 350, 12, 71, 1.5, 80],
    ['Semoule cuite', 'Couscous (cooked)', 112, 3.8, 23, 0.2, 200],
    ['Boulgour cuit', 'Bulgur (cooked)', 83, 3.1, 19, 0.2, 200],
    ['Quinoa cuit', 'Quinoa (cooked)', 120, 4.4, 21, 1.9, 200],
    ['Pommes de terre cuites', 'Boiled potatoes', 87, 2, 20, 0.1, 200],
    ['Purée de pommes de terre', 'Mashed potatoes', 105, 2, 15, 4, 200],
    ['Frites', 'Chips', 280, 3.5, 36, 13, 150],
    ['Patate douce cuite', 'Baked sweet potato', 90, 2, 21, 0.1, 200],
    ['Baguette', 'Baguette', 270, 9, 55, 1, 70],
    ['Pain complet', 'Wholemeal bread', 250, 9, 45, 2.5, 70],
    ['Pain de mie', 'Sliced white bread', 270, 8, 49, 3.5, 35],
    ['Pain aux céréales', 'Multigrain bread', 260, 10, 43, 4, 70],
    ['Biscottes', 'Crispbread', 390, 12, 75, 5, 20],
    ["Flocons d'avoine", 'Rolled oats', 370, 13, 60, 7, 60],
    ['Muesli', 'Muesli', 360, 10, 60, 8, 60],
    ['Céréales au chocolat', 'Chocolate cereal', 390, 7, 77, 5, 40],
    ['Tortilla de blé', 'Wheat tortilla', 300, 8, 50, 7, 60],
    ['Pain pita', 'Pita bread', 275, 9, 55, 1.2, 65],
    ['Polenta cuite', 'Polenta (cooked)', 85, 2, 18, 0.3, 200],
    ['Gnocchi', 'Gnocchi', 170, 4, 34, 1.5, 200],
    ['Nouilles cuites', 'Noodles (cooked)', 140, 4.5, 26, 2, 200],
  ],
  pulses: [
    ['Lentilles cuites', 'Cooked lentils', 116, 9, 20, 0.4, 150],
    ['Lentilles crues', 'Lentils (dry)', 340, 24, 60, 1.5, 70],
    ['Pois chiches cuits', 'Cooked chickpeas', 140, 7, 22, 2.5, 150],
    ['Haricots rouges cuits', 'Cooked kidney beans', 127, 9, 22, 0.5, 150],
    ['Haricots blancs cuits', 'Cooked white beans', 130, 9, 23, 0.5, 150],
    ['Pois cassés cuits', 'Cooked split peas', 118, 8, 21, 0.4, 150],
    ['Fèves', 'Broad beans', 88, 8, 12, 0.7, 150],
    ['Houmous', 'Hummus', 300, 8, 15, 24, 50],
  ],
  meat: [
    ['Blanc de poulet', 'Chicken breast', 110, 23, 0, 1.5, 150],
    ['Cuisse de poulet', 'Chicken thigh', 180, 20, 0, 11, 150],
    ['Escalope de dinde', 'Turkey escalope', 105, 23, 0, 1, 150],
    ['Steak haché 5%', 'Lean beef mince (5%)', 125, 21, 0, 5, 150],
    ['Steak haché 15%', 'Beef mince (15%)', 215, 19, 0, 15, 150],
    ['Steak de bœuf', 'Beef steak', 180, 26, 0, 8, 150],
    ['Côte de porc', 'Pork chop', 200, 25, 0, 11, 150],
    ['Filet mignon de porc', 'Pork tenderloin', 135, 22, 0, 5, 150],
    ['Jambon blanc', 'Cooked ham', 110, 19, 1, 3, 50],
    ['Jambon cru', 'Cured ham', 240, 27, 0.5, 14, 30],
    ['Bacon', 'Bacon', 350, 24, 0.5, 28, 30],
    ['Saucisse', 'Sausage', 300, 15, 2, 26, 100],
    ['Chorizo', 'Chorizo', 450, 24, 2, 38, 30],
    ['Lardons', 'Bacon lardons', 300, 16, 1, 26, 50],
    ['Agneau', 'Lamb', 250, 25, 0, 16, 150],
    ['Veau', 'Veal', 160, 24, 0, 7, 150],
    ['Magret de canard', 'Duck breast', 200, 22, 0, 12, 150],
    ['Merguez', 'Merguez sausage', 320, 17, 1, 28, 100],
    ['Nuggets de poulet', 'Chicken nuggets', 290, 15, 17, 18, 120],
    ['Cordon bleu', 'Cordon bleu', 250, 15, 16, 14, 120],
  ],
  fish: [
    ['Saumon', 'Salmon', 200, 20, 0, 13, 130],
    ['Saumon fumé', 'Smoked salmon', 180, 22, 0, 10, 60],
    ['Cabillaud', 'Cod', 80, 18, 0, 0.7, 150],
    ['Colin', 'Hake', 75, 17, 0, 0.9, 150],
    ['Thon au naturel', 'Tuna in water', 110, 25, 0, 1, 100],
    ['Thon frais', 'Fresh tuna', 145, 24, 0, 5, 130],
    ["Sardines à l'huile", 'Sardines in oil', 220, 24, 0, 13, 80],
    ['Maquereau', 'Mackerel', 205, 19, 0, 14, 130],
    ['Truite', 'Trout', 140, 20, 0, 6, 130],
    ['Daurade', 'Sea bream', 100, 20, 0, 2.5, 150],
    ['Crevettes', 'Prawns', 85, 20, 0, 0.5, 120],
    ['Moules', 'Mussels', 90, 12, 4, 2.5, 200],
    ['Calamar', 'Squid', 92, 16, 3, 1.4, 150],
    ['Surimi', 'Surimi', 100, 9, 12, 1.5, 80],
    ['Huîtres', 'Oysters', 70, 8, 4, 2, 100],
  ],
  dairy: [
    ['Œuf', 'Egg', 143, 12.5, 0.7, 10, 60],
    ["Blanc d'œuf", 'Egg white', 52, 11, 0.7, 0.2, 33],
    ['Omelette', 'Omelette', 154, 11, 1, 12, 150],
    ['Lait entier', 'Whole milk', 63, 3.3, 4.8, 3.6, 200, 'ml'],
    ['Lait demi-écrémé', 'Semi-skimmed milk', 46, 3.3, 4.8, 1.6, 200, 'ml'],
    ['Lait écrémé', 'Skimmed milk', 34, 3.4, 4.9, 0.1, 200, 'ml'],
    ["Boisson d'amande", 'Almond drink', 24, 0.5, 3, 1.1, 200, 'ml'],
    ['Boisson de soja', 'Soya drink', 40, 3.3, 2.5, 1.8, 200, 'ml'],
    ["Boisson d'avoine", 'Oat drink', 45, 0.6, 7, 1.3, 200, 'ml'],
    ['Yaourt nature', 'Plain yoghurt', 60, 4, 5, 3, 125],
    ['Yaourt nature 0%', 'Plain 0% yoghurt', 40, 4.5, 5, 0.1, 125],
    ['Skyr', 'Skyr', 60, 10, 4, 0.2, 150],
    ['Fromage blanc 3%', 'Quark (3%)', 70, 8, 4, 3, 150],
    ['Yaourt grec', 'Greek yoghurt', 115, 6, 4, 9, 150],
    ['Yaourt aux fruits', 'Fruit yoghurt', 95, 3.5, 15, 2.5, 125],
    ['Petit-suisse', 'Petit-suisse', 130, 8, 4, 8, 60],
    ['Crème fraîche', 'Crème fraîche', 290, 2.4, 3, 30, 30],
    ['Crème légère 15%', 'Single cream (15%)', 160, 2.8, 3.5, 15, 30],
    ['Beurre', 'Butter', 745, 0.7, 0.6, 82, 10],
    ['Emmental', 'Emmental', 370, 28, 0.5, 29, 30],
    ['Gruyère', 'Gruyère', 400, 27, 0.5, 32, 30],
    ['Comté', 'Comté', 410, 28, 0.5, 34, 30],
    ['Camembert', 'Camembert', 300, 20, 0.5, 24, 30],
    ['Brie', 'Brie', 335, 19, 0.5, 28, 30],
    ['Fromage de chèvre', "Goat's cheese", 280, 18, 1, 22, 30],
    ['Roquefort', 'Roquefort', 370, 20, 2, 31, 30],
    ['Mozzarella', 'Mozzarella', 250, 18, 1, 19, 60],
    ['Feta', 'Feta', 260, 17, 1.5, 21, 40],
    ['Parmesan', 'Parmesan', 400, 33, 0, 29, 15],
    ['Ricotta', 'Ricotta', 140, 9, 3, 10, 50],
    ['Fromage râpé', 'Grated cheese', 380, 27, 1, 29, 25],
    ['Fromage frais à tartiner', 'Cream cheese', 250, 6, 4, 23, 30],
    ['Crème dessert', 'Dairy dessert', 130, 3, 20, 4, 100],
    ['Glace vanille', 'Vanilla ice cream', 200, 3.5, 24, 10, 80],
  ],
  'plant-protein': [
    ['Tofu ferme', 'Firm tofu', 130, 13, 2, 8, 150],
    ['Tofu soyeux', 'Silken tofu', 60, 6, 2, 3, 150],
    ['Tempeh', 'Tempeh', 190, 19, 8, 11, 120],
    ['Seitan', 'Seitan', 140, 25, 4, 2, 120],
    ['Steak de soja', 'Soya burger', 200, 17, 10, 10, 100],
    ['Protéine en poudre', 'Whey protein powder', 380, 78, 8, 5, 30],
    ['Levure maltée', 'Nutritional yeast', 350, 45, 20, 5, 10],
  ],
  fats: [
    ["Huile d'olive", 'Olive oil', 884, 0, 0, 100, 10, 'ml'],
    ['Huile de tournesol', 'Sunflower oil', 884, 0, 0, 100, 10, 'ml'],
    ['Huile de colza', 'Rapeseed oil', 884, 0, 0, 100, 10, 'ml'],
    ['Margarine', 'Margarine', 720, 0.2, 0.7, 80, 10],
    ['Mayonnaise', 'Mayonnaise', 680, 1, 2, 74, 15],
    ['Amandes', 'Almonds', 600, 21, 7, 53, 30],
    ['Noix', 'Walnuts', 690, 15, 7, 65, 30],
    ['Noisettes', 'Hazelnuts', 650, 15, 8, 61, 30],
    ['Cacahuètes', 'Peanuts', 590, 26, 8, 49, 30],
    ['Pistaches', 'Pistachios', 570, 20, 15, 45, 30],
    ['Noix de cajou', 'Cashews', 570, 18, 27, 44, 30],
    ['Graines de courge', 'Pumpkin seeds', 560, 30, 11, 49, 20],
    ['Graines de chia', 'Chia seeds', 490, 17, 8, 31, 15],
    ['Graines de lin', 'Linseed', 530, 18, 2, 42, 15],
    ['Beurre de cacahuète', 'Peanut butter', 590, 25, 12, 50, 20],
    ["Purée d'amande", 'Almond butter', 620, 21, 8, 56, 20],
    ['Tahin', 'Tahini', 600, 17, 10, 54, 20],
    ['Noix de coco râpée', 'Desiccated coconut', 650, 7, 12, 62, 20],
  ],
  dishes: [
    ['Pizza margherita', 'Margherita pizza', 260, 11, 30, 10, 300],
    ['Sandwich jambon-beurre', 'Ham baguette sandwich', 250, 11, 30, 9, 200],
    ['Sandwich poulet crudités', 'Chicken salad sandwich', 200, 11, 24, 6, 220],
    ['Hamburger', 'Hamburger', 250, 13, 25, 11, 220],
    ['Kebab', 'Doner kebab', 215, 14, 17, 10, 350],
    ['Sushis', 'Sushi', 145, 6, 26, 1.5, 200],
    ['Salade César', 'Caesar salad', 180, 9, 6, 14, 250],
    ['Quiche lorraine', 'Quiche lorraine', 280, 10, 20, 18, 150],
    ['Lasagnes', 'Lasagne', 150, 8, 14, 7, 350],
    ['Hachis parmentier', "Shepherd's pie", 125, 7, 12, 5, 350],
    ['Couscous', 'Couscous (dish)', 140, 7, 18, 4, 350],
    ['Paella', 'Paella', 150, 8, 18, 4, 350],
    ['Risotto', 'Risotto', 145, 4, 22, 4, 300],
    ['Soupe de légumes', 'Vegetable soup', 40, 1.2, 7, 0.8, 300, 'ml'],
    ['Velouté de tomate', 'Tomato soup', 55, 1.2, 8, 2, 300, 'ml'],
    ['Ratatouille', 'Ratatouille', 70, 1.2, 6, 4, 250],
    ['Gratin dauphinois', 'Potato gratin', 160, 3, 14, 10, 250],
    ['Omelette au fromage', 'Cheese omelette', 200, 14, 1, 16, 180],
    ['Poulet rôti', 'Roast chicken', 190, 25, 0, 10, 150],
    ['Poisson pané', 'Breaded fish', 200, 13, 16, 9, 120],
    ['Riz cantonais', 'Egg fried rice', 165, 5, 25, 5, 300],
    ['Nouilles sautées', 'Stir-fried noodles', 170, 6, 24, 5, 300],
    ['Tajine de poulet', 'Chicken tagine', 130, 12, 8, 6, 350],
    ['Chili con carne', 'Chili con carne', 130, 9, 11, 5, 300],
    ['Burrito', 'Burrito', 200, 9, 25, 7, 250],
    ['Falafels', 'Falafel', 330, 13, 32, 18, 120],
    ['Samoussa', 'Samosa', 300, 7, 30, 17, 80],
  ],
  drinks: [
    ['Eau', 'Water', 0, 0, 0, 0, 250, 'ml'],
    ['Café noir', 'Black coffee', 2, 0.1, 0, 0, 100, 'ml'],
    ['Thé', 'Tea', 1, 0, 0, 0, 200, 'ml'],
    ['Café au lait', 'Latte', 45, 2.4, 3.5, 2.4, 250, 'ml'],
    ["Jus d'orange", 'Orange juice', 45, 0.7, 10, 0.1, 200, 'ml'],
    ['Jus de pomme', 'Apple juice', 46, 0.1, 11, 0.1, 200, 'ml'],
    ['Soda', 'Cola', 42, 0, 10.6, 0, 330, 'ml'],
    ['Soda light', 'Diet cola', 0.3, 0, 0, 0, 330, 'ml'],
    ['Limonade', 'Lemonade', 40, 0, 10, 0, 330, 'ml'],
    ['Sirop dilué', 'Cordial (diluted)', 40, 0, 10, 0, 250, 'ml'],
    ['Bière', 'Beer', 43, 0.5, 3.6, 0, 250, 'ml'],
    ['Vin rouge', 'Red wine', 85, 0.1, 2.6, 0, 125, 'ml'],
    ['Vin blanc', 'White wine', 82, 0.1, 2.6, 0, 125, 'ml'],
    ['Champagne', 'Champagne', 80, 0.2, 1.4, 0, 100, 'ml'],
    ['Boisson énergisante', 'Energy drink', 45, 0, 11, 0, 250, 'ml'],
    ['Smoothie', 'Smoothie', 55, 0.8, 12, 0.3, 250, 'ml'],
    ['Chocolat chaud', 'Hot chocolate', 80, 3, 11, 2.5, 250, 'ml'],
  ],
  sweets: [
    ['Sucre', 'Sugar', 400, 0, 100, 0, 5],
    ['Miel', 'Honey', 320, 0.4, 80, 0, 20],
    ['Confiture', 'Jam', 260, 0.4, 63, 0.1, 20],
    ['Pâte à tartiner chocolat-noisette', 'Chocolate hazelnut spread', 540, 6, 57, 31, 20],
    ['Chocolat noir 70%', 'Dark chocolate (70%)', 560, 8, 34, 42, 25],
    ['Chocolat au lait', 'Milk chocolate', 540, 7, 57, 31, 25],
    ['Biscuits secs', 'Plain biscuits', 450, 6, 70, 16, 30],
    ['Cookie', 'Cookie', 480, 5, 63, 23, 40],
    ['Croissant', 'Croissant', 400, 8, 45, 21, 60],
    ['Pain au chocolat', 'Pain au chocolat', 420, 8, 47, 22, 70],
    ['Brioche', 'Brioche', 350, 8, 50, 13, 60],
    ['Madeleine', 'Madeleine', 420, 6, 52, 20, 30],
    ['Crêpe', 'Pancake', 210, 6, 30, 7, 70],
    ['Gaufre', 'Waffle', 300, 6, 40, 13, 80],
    ['Gâteau au chocolat', 'Chocolate cake', 400, 5, 50, 20, 90],
    ['Tarte aux pommes', 'Apple tart', 250, 3, 35, 11, 120],
    ['Chips', 'Crisps', 530, 6, 50, 34, 30],
    ['Pop-corn', 'Popcorn', 480, 8, 60, 24, 30],
    ['Barre de céréales', 'Cereal bar', 400, 6, 65, 12, 25],
    ['Bonbons', 'Sweets', 350, 1, 85, 0.5, 30],
    ['Cacahuètes salées', 'Salted peanuts', 600, 25, 8, 50, 30],
  ],
  pantry: [
    ['Sauce tomate', 'Passata', 40, 1.5, 6, 0.5, 100],
    ['Ketchup', 'Ketchup', 100, 1.2, 23, 0.1, 15],
    ['Moutarde', 'Mustard', 65, 4, 5, 3, 10],
    ['Sauce soja', 'Soy sauce', 55, 6, 5, 0, 10, 'ml'],
    ['Vinaigrette', 'Vinaigrette', 350, 0.5, 5, 36, 15],
    ['Béchamel', 'Béchamel', 120, 3.5, 8, 8, 80],
    ['Pesto', 'Pesto', 450, 5, 6, 45, 20],
    ['Bouillon cube', 'Stock cube', 200, 10, 15, 11, 10],
    ['Crème de coco', 'Coconut milk', 180, 2, 3, 18, 100, 'ml'],
    ['Lait concentré sucré', 'Condensed milk', 320, 8, 55, 8, 30],
    ['Farine de blé', 'Plain flour', 350, 10, 73, 1, 30],
    ['Chapelure', 'Breadcrumbs', 370, 12, 72, 3, 20],
  ],
};

export type Food = {
  id: string;
  fr: string;
  en: string;
  category: FoodCategory;
  unit: 'g' | 'ml';
  /** Per 100 g or 100 ml. */
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** One ordinary helping, in `unit`. The quantity the sheet starts on. */
  portion: number;
};

export const FOODS: Food[] = (Object.keys(DATA) as FoodCategory[]).flatMap((category) =>
  DATA[category].map(([fr, en, kcal, protein, carbs, fat, portion, unit]) => ({
    id: slugify(en),
    fr,
    en,
    category,
    unit: unit ?? 'g',
    kcal,
    protein,
    carbs,
    fat,
    portion,
  }))
);

/** The food's name in the language the app is running in. */
export function foodName(food: Food): string {
  return lang === 'fr' ? food.fr : food.en;
}

export type FoodAmounts = { calories: number; proteinG: number; carbsG: number; fatG: number };

/**
 * “180 kcal · 22 g prot · 3 g carbs · 8 g fat”, on one line.
 *
 * A macronutrient nobody recorded is left out rather than shown as 0 g: an entry from before the
 * app asked for carbohydrate did not contain none of it.
 */
export function macroSummary(amounts: {
  calories: number;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
}): string {
  const parts = [t('{count} kcal', { count: amounts.calories })];
  if (amounts.proteinG != null) parts.push(`${amounts.proteinG} g ${t('prot')}`);
  if (amounts.carbsG != null) parts.push(`${amounts.carbsG} g ${t('carbs')}`);
  if (amounts.fatG != null) parts.push(`${amounts.fatG} g ${t('fat')}`);
  return parts.join(' · ');
}

/** What a given quantity of a food comes to, rounded the way it will be stored. */
export function amountsFor(food: Food, quantity: number): FoodAmounts {
  const factor = quantity / 100;
  return {
    calories: Math.round(food.kcal * factor),
    proteinG: Math.round(food.protein * factor),
    carbsG: Math.round(food.carbs * factor),
    fatG: Math.round(food.fat * factor),
  };
}

/**
 * The foods worth offering for what has been typed so far, best first.
 *
 * Both names are searched, and a match at the start of a word beats a match in the middle: typing
 * "pou" should reach "poulet" before "Petit-suisse". Below three characters nothing is offered —
 * two letters match half the table and the list would be noise.
 */
export function searchFoods(query: string, limit = 8): Food[] {
  const needle = slugify(query);
  if (needle.length < 2) return [];
  const scored: { food: Food; score: number }[] = [];
  for (const food of FOODS) {
    const score = Math.min(rank(slugify(food.fr), needle), rank(slugify(food.en), needle));
    if (score < 4) scored.push({ food, score });
  }
  return scored
    .sort((a, b) => a.score - b.score || a.food.fr.length - b.food.fr.length)
    .slice(0, limit)
    .map((entry) => entry.food);
}

/** 0 exact, 1 starts the name, 2 starts a word inside it, 3 appears anywhere, 4 absent. */
function rank(slug: string, needle: string): number {
  if (slug === needle) return 0;
  if (slug.startsWith(needle)) return 1;
  if (slug.includes(`-${needle}`)) return 2;
  return slug.includes(needle) ? 3 : 4;
}
