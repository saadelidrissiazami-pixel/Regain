import { describe, expect, it } from 'vitest';

import { buildWeekView, greetingFor } from '../src/features/planning/weekView';

describe('greetingFor', () => {
  it('dit bonjour le jour et bonsoir le soir', () => {
    expect(greetingFor(8)).toBe('Bonjour');
    expect(greetingFor(17)).toBe('Bonjour');
    expect(greetingFor(18)).toBe('Bonsoir');
    expect(greetingFor(2)).toBe('Bonsoir');
  });
});

describe('buildWeekView', () => {
  const items = [
    { id: 'a', date: '2026-09-14', status: 'propose' },
    { id: 'b', date: '2026-09-15', status: 'realise' },
    { id: 'c', date: '2026-09-17', status: 'propose' },
    { id: 'd', date: '2026-09-18', status: 'propose' },
    { id: 'e', date: '2026-09-17', status: 'propose' },
  ];

  it("range à part les activités non faites des jours passés et regroupe le reste par jour", () => {
    const view = buildWeekView(items, '2026-09-17');
    expect(view.pastPending.map((i) => i.id)).toEqual(['a']);
    expect(view.upcomingDays.map((d) => [d.date, d.items.map((i) => i.id)])).toEqual([
      ['2026-09-17', ['c', 'e']],
      ['2026-09-18', ['d']],
    ]);
  });

  it('compte ce qui est fait sur toute la semaine', () => {
    const view = buildWeekView(items, '2026-09-17');
    expect([view.doneCount, view.totalCount]).toEqual([1, 5]);
  });

  it('gère une semaine vide', () => {
    expect(buildWeekView([], '2026-09-17')).toEqual({ upcomingDays: [], pastPending: [], doneCount: 0, totalCount: 0 });
  });
});
