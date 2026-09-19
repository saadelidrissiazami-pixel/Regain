import { describe, expect, it } from 'vitest';

import { buildWeekView, coachLine, formatCountdown, greetingFor, isOver, minutesUntil, todaySubtitle } from '../src/features/planning/weekView';

describe('greetingFor', () => {
  it('suit les moments de la journée', () => {
    expect(greetingFor(8)).toBe('Bonjour');
    expect(greetingFor(12)).toBe('Bon après-midi');
    expect(greetingFor(17)).toBe('Bon après-midi');
    expect(greetingFor(18)).toBe('Bonsoir');
    expect(greetingFor(2)).toBe('Bonsoir');
  });
});

describe('compte à rebours', () => {
  const now = new Date(2026, 8, 22, 15, 42);

  it("calcule les minutes jusqu'à une heure du jour", () => {
    expect(minutesUntil('2026-09-22', '17:30', now)).toBe(108);
    expect(minutesUntil('2026-09-22', '15:00', now)).toBe(-42);
    expect(minutesUntil('2026-09-23', '09:00', now)).toBe(17 * 60 + 18);
  });

  it('écrit le délai en clair', () => {
    expect(formatCountdown(25)).toBe('dans 25 min');
    expect(formatCountdown(108)).toBe('dans 1 h 48');
    expect(formatCountdown(180)).toBe('dans 3 h');
    expect(formatCountdown(65)).toBe('dans 1 h 05');
    expect(formatCountdown(0)).toBeNull();
    expect(formatCountdown(-10)).toBeNull();
  });

  it("considère une activité terminée seulement après sa fin", () => {
    expect(isOver('2026-09-22', '07:00', 60, now)).toBe(true);
    expect(isOver('2026-09-22', '15:00', 60, now)).toBe(false);
    expect(isOver('2026-09-22', '17:30', 20, now)).toBe(false);
    expect(isOver('2026-09-23', '07:00', 60, now)).toBe(false);
  });

  it("résume ce qu'il reste aujourd'hui", () => {
    expect(todaySubtitle(2, 15)).toBe("2 activités aujourd'hui");
    expect(todaySubtitle(1, 20)).toBe('1 activité ce soir');
    expect(todaySubtitle(0, 10)).toBe("Rien de prévu d'ici la fin de la journée");
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

describe('phrase du coach', () => {
  const base = { hasPlan: true, doneCount: 0, totalCount: 8, pendingToday: 1, hour: 15 };
  it('encourage quand la semaine avance', () => {
    expect(coachLine({ ...base, doneCount: 3 })).toBe('On continue, tu fais du super travail.');
  });
  it('dit ce qui est prévu en début de semaine', () => {
    expect(coachLine(base)).toBe("Voici ce qui est prévu aujourd'hui.");
  });
  it('félicite quand tout est fait', () => {
    expect(coachLine({ ...base, doneCount: 8 })).toContain('bouclée');
  });
  it('invite à construire la semaine sans planning', () => {
    expect(coachLine({ ...base, hasPlan: false })).toContain('construire');
  });
});
