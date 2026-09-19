import { describe, expect, it } from 'vitest';

import { recommendWellbeing } from '../src/features/wellbeing/recommend';
import type { WellbeingProgram } from '../src/features/wellbeing/types';

const program = (slug: string, category: string, duration = 10, premium = false): WellbeingProgram => ({
  id: slug,
  slug,
  title: slug,
  category,
  session_count: 1,
  premium_only: premium,
  duration_minutes: duration,
});

const PROGRAMS = [
  program('souffle', 'Respiration', 5),
  program('scan', 'Méditation', 15),
  program('nuit', 'Sommeil', 12),
  program('regard', 'Confiance en soi', 10),
  program('page', 'Journaling', 8),
  program('scene', 'En public', 10, true),
];

describe('recommandation bien-être', () => {
  it('propose le sommeil tard le soir', () => {
    const [first] = recommendWellbeing({ programs: PROGRAMS, completedIds: new Set(), hour: 22, energy: null, isPremium: true });
    expect(first.program.category).toBe('Sommeil');
    expect(first.reason).toContain('nuit');
  });

  it("propose la respiration quand l'énergie est basse", () => {
    const [first] = recommendWellbeing({ programs: PROGRAMS, completedIds: new Set(), hour: 15, energy: 'bas', isPremium: true });
    expect(first.program.category).toBe('Respiration');
  });

  it("ne propose jamais une séance verrouillée à un compte gratuit", () => {
    const recos = recommendWellbeing({ programs: PROGRAMS, completedIds: new Set(), hour: 15, energy: 'eleve', isPremium: false }, 6);
    expect(recos.some((r) => r.program.premium_only)).toBe(false);
  });

  it('donne au plus une séance par thème', () => {
    const recos = recommendWellbeing({ programs: [...PROGRAMS, program('souffle-2', 'Respiration', 6)], completedIds: new Set(), hour: 10, energy: 'bas', isPremium: true });
    const categories = recos.map((r) => r.program.category);
    expect(new Set(categories).size).toBe(categories.length);
    expect(recos).toHaveLength(3);
  });

  it("préfère une séance pas encore faite", () => {
    const programs = [program('a', 'Méditation', 10), program('b', 'Méditation', 12)];
    const [first] = recommendWellbeing({ programs, completedIds: new Set(['a']), hour: 15, energy: null, isPremium: true });
    expect(first.program.slug).toBe('b');
  });
});
