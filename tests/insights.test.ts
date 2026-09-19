import { describe, expect, it } from 'vitest';

import { dailyAverages, energyLabel, lastDays, moodLabel, percentChange, splitWeeks } from '../src/features/tracking/insights';

const at = (date: string, value: number) => ({ at: new Date(`${date}T12:00:00`).toISOString(), value });

describe('indicateurs de suivi', () => {
  it('liste les derniers jours dans l’ordre', () => {
    expect(lastDays('2026-09-19', 3)).toEqual(['2026-09-17', '2026-09-18', '2026-09-19']);
    expect(lastDays('2026-03-01', 2)).toEqual(['2026-02-28', '2026-03-01']);
  });

  it('fait la moyenne par jour, null sans mesure', () => {
    expect(dailyAverages([at('2026-09-18', 1), at('2026-09-18', 5), at('2026-09-19', 3)], ['2026-09-17', '2026-09-18', '2026-09-19'])).toEqual([null, 3, 3]);
  });

  it('compare la semaine à la précédente', () => {
    const { current, previous } = splitWeeks([at('2026-09-19', 4), at('2026-09-10', 2), at('2026-09-01', 5)], '2026-09-19');
    expect(current).toEqual([4]);
    expect(previous).toEqual([2]);
    expect(percentChange(4, 2)).toBe(100);
    expect(percentChange(4, null)).toBeNull();
  });

  it('traduit les moyennes en mots', () => {
    expect(energyLabel(4.2).label).toBe('Bonne');
    expect(energyLabel(1.5).label).toBe('Basse');
    expect(moodLabel(4)).toBe('Positive');
  });
});
