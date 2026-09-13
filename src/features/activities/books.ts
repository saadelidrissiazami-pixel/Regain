// Sélection de classiques du domaine public (auteurs et œuvres réels), choisis pour leur lien
// avec les thématiques de l'app. "keyIdea" est une idée clé reformulée par nos soins — pas une
// citation exacte tirée d'une traduction précise — pour rester honnête sur ce qui est cité.
export type BookRecommendation = {
  title: string;
  author: string;
  year: string;
  keyIdea: string;
  tags: string[];
};

export const BOOK_RECOMMENDATIONS: BookRecommendation[] = [
  {
    title: 'Pensées pour moi-même',
    author: 'Marc Aurèle',
    year: 'vers 180 apr. J.-C.',
    keyIdea:
      "Vous ne contrôlez pas ce qui vous arrive, seulement la façon dont vous y répondez — c'est là que se loge toute votre liberté.",
    tags: ['gerer_stress', 'confiance_en_soi'],
  },
  {
    title: 'Manuel',
    author: 'Épictète',
    year: 'vers 125 apr. J.-C.',
    keyIdea:
      "Certaines choses dépendent de nous, d'autres non. La tranquillité commence quand on cesse de confondre les deux.",
    tags: ['gerer_stress', 'routine_stable'],
  },
  {
    title: 'Lettres à Lucilius',
    author: 'Sénèque',
    year: 'vers 65 apr. J.-C.',
    keyIdea: "Nous souffrons plus souvent en imagination qu'en réalité — la plupart de nos craintes n'arrivent jamais.",
    tags: ['gerer_stress', 'mieux_dormir'],
  },
  {
    title: 'Walden ou la Vie dans les bois',
    author: 'Henry David Thoreau',
    year: '1854',
    keyIdea: "Simplifier sa vie, c'est se donner enfin le temps de la regarder vraiment.",
    tags: ['reduire_ecrans', 'routine_stable'],
  },
  {
    title: 'Tao Te King',
    author: 'Lao Tseu',
    year: 'vers 4e siècle av. J.-C.',
    keyIdea: "La souplesse l'emporte souvent sur la rigidité, comme l'eau qui use la pierre sans jamais forcer.",
    tags: ['gerer_stress', 'plus_energie'],
  },
  {
    title: 'Essais',
    author: 'Michel de Montaigne',
    year: '1580',
    keyIdea: "Se connaître soi-même est la première étape pour choisir qui laisser entrer dans sa vie.",
    tags: ['plus_social', 'confiance_en_soi'],
  },
];

export function pickBookForGoals(primaryGoals: string[]): BookRecommendation {
  const scored = BOOK_RECOMMENDATIONS.map((book) => ({
    book,
    score: book.tags.filter((t) => primaryGoals.includes(t)).length,
  })).sort((a, b) => b.score - a.score);
  return scored[0]?.book ?? BOOK_RECOMMENDATIONS[0];
}
