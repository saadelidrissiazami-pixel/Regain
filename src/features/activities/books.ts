// A selection of public-domain classics (real authors, real works), chosen for what they have
// to do with the app's themes. "keyIdea" is a key idea put in our own words — not an exact quote
// from any particular translation — so that nothing is passed off as a citation it is not.
export type BookRecommendation = {
  title: string;
  author: string;
  year: string;
  keyIdea: string;
  tags: string[];
};

export const BOOK_RECOMMENDATIONS: BookRecommendation[] = [
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    year: 'c. 180 AD',
    keyIdea:
      'You do not control what happens to you, only how you answer it — and that is where all your freedom sits.',
    tags: ['gerer_stress', 'confiance_en_soi'],
  },
  {
    title: 'The Enchiridion',
    author: 'Epictetus',
    year: 'c. 125 AD',
    keyIdea:
      'Some things are up to us and some are not. Calm begins when you stop confusing the two.',
    tags: ['gerer_stress', 'routine_stable'],
  },
  {
    title: 'Letters from a Stoic',
    author: 'Seneca',
    year: 'c. 65 AD',
    keyIdea: 'We suffer more often in imagination than in reality — most of what we fear never arrives.',
    tags: ['gerer_stress', 'mieux_dormir'],
  },
  {
    title: 'Walden',
    author: 'Henry David Thoreau',
    year: '1854',
    keyIdea: 'Simplifying your life is how you finally give yourself the time to look at it.',
    tags: ['reduire_ecrans', 'routine_stable'],
  },
  {
    title: 'Tao Te Ching',
    author: 'Laozi',
    year: 'c. 4th century BC',
    keyIdea: 'Yielding often beats rigidity, the way water wears down stone without ever forcing it.',
    tags: ['gerer_stress', 'plus_energie'],
  },
  {
    title: 'Essays',
    author: 'Michel de Montaigne',
    year: '1580',
    keyIdea: 'Knowing yourself is the first step towards choosing who to let into your life.',
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
