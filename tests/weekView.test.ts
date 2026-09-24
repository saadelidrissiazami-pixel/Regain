import { describe, expect, it } from 'vitest';

import { buildWeekView, coachLine, formatCountdown, greetingFor, isOver, minutesUntil, todaySubtitle } from '../src/features/planning/weekView';

describe('greetingFor', () => {
  it('follows the parts of the day', () => {
    expect(greetingFor(8)).toBe('Good morning');
    expect(greetingFor(12)).toBe('Good afternoon');
    expect(greetingFor(17)).toBe('Good afternoon');
    expect(greetingFor(18)).toBe('Good evening');
    expect(greetingFor(2)).toBe('Good evening');
  });
});

describe('the countdown', () => {
  const now = new Date(2026, 8, 22, 15, 42);

  it('works out the minutes until a time of day', () => {
    expect(minutesUntil('2026-09-22', '17:30', now)).toBe(108);
    expect(minutesUntil('2026-09-22', '15:00', now)).toBe(-42);
    expect(minutesUntil('2026-09-23', '09:00', now)).toBe(17 * 60 + 18);
  });

  it('writes the delay in plain words', () => {
    expect(formatCountdown(25)).toBe('in 25 min');
    expect(formatCountdown(108)).toBe('in 1h 48');
    expect(formatCountdown(180)).toBe('in 3h');
    expect(formatCountdown(65)).toBe('in 1h 05');
    expect(formatCountdown(0)).toBeNull();
    expect(formatCountdown(-10)).toBeNull();
  });

  it('counts an activity as over only after it ends', () => {
    expect(isOver('2026-09-22', '07:00', 60, now)).toBe(true);
    expect(isOver('2026-09-22', '15:00', 60, now)).toBe(false);
    expect(isOver('2026-09-22', '17:30', 20, now)).toBe(false);
    expect(isOver('2026-09-23', '07:00', 60, now)).toBe(false);
  });

  it('sums up what is left today', () => {
    expect(todaySubtitle(2, 15)).toBe('2 activities today');
    expect(todaySubtitle(1, 20)).toBe('1 activity this evening');
    expect(todaySubtitle(0, 10)).toBe('Nothing planned before the day is out');
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

  it('sets aside undone activities from past days and groups the rest by day', () => {
    const view = buildWeekView(items, '2026-09-17');
    expect(view.pastPending.map((i) => i.id)).toEqual(['a']);
    expect(view.upcomingDays.map((d) => [d.date, d.items.map((i) => i.id)])).toEqual([
      ['2026-09-17', ['c', 'e']],
      ['2026-09-18', ['d']],
    ]);
  });

  it('counts what is done across the whole week', () => {
    const view = buildWeekView(items, '2026-09-17');
    expect([view.doneCount, view.totalCount]).toEqual([1, 5]);
  });

  it('handles an empty week', () => {
    expect(buildWeekView([], '2026-09-17')).toEqual({ upcomingDays: [], pastPending: [], doneCount: 0, totalCount: 0 });
  });
});

describe('the coach’s line', () => {
  const base = { hasPlan: true, doneCount: 0, totalCount: 8, pendingToday: 1, hour: 15 };
  it('encourages when the week is getting on', () => {
    expect(coachLine({ ...base, doneCount: 3 })).toBe('Keep going — you are doing well.');
  });
  it('says what is planned at the start of the week', () => {
    expect(coachLine(base)).toBe('Here is what is planned for today.');
  });
  it('congratulates when everything is done', () => {
    expect(coachLine({ ...base, doneCount: 8 })).toContain('Week complete');
  });
  it('invites you to build the week when there is no plan', () => {
    expect(coachLine({ ...base, hasPlan: false })).toContain('still to be built');
  });
});
