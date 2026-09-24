import { describe, expect, it } from 'vitest';

import {
  COURSE_CATEGORY,
  COURSES,
  courseBySlug,
  courseProgress,
  courseStatusLabel,
} from '../src/features/wellbeing/courses';
import type { WellbeingProgram } from '../src/features/wellbeing/types';
import { CONTENT_BY_SLUG } from '../src/features/wellbeing/content';
import { contentDuration } from '../src/features/wellbeing/narration';

const day = (course: string, n: number): WellbeingProgram => ({
  id: `${course}-${n}`,
  slug: `${course}-j${n}`,
  title: `Jour ${n}`,
  category: COURSE_CATEGORY,
  session_count: 1,
  premium_only: n > 3,
  duration_minutes: 3,
  course_slug: course,
  course_day: n,
});

const MEDITATION = COURSES[0];
const dix = Array.from({ length: 10 }, (_, i) => day(MEDITATION.slug, i + 1));
// An ordinary session, which must never end up inside a course.
const horsParcours: WellbeingProgram = { ...day(MEDITATION.slug, 99), course_slug: null, course_day: null };

describe('avancement d un parcours', () => {
  it('range les jours dans l ordre, quel que soit celui de la base', () => {
    const melange = [dix[4], dix[0], dix[9], dix[2]];
    expect(courseProgress(MEDITATION, melange, new Set()).days.map((d) => d.day)).toEqual([1, 3, 5, 10]);
  });

  it('ignores sessions that do not belong to the course', () => {
    expect(courseProgress(MEDITATION, [...dix, horsParcours], new Set()).days).toHaveLength(10);
  });

  it('propose le jour 1 quand rien n est fait', () => {
    const progress = courseProgress(MEDITATION, dix, new Set());
    expect(progress.doneCount).toBe(0);
    expect(progress.nextDay?.day).toBe(1);
    expect(progress.complete).toBe(false);
  });

  it('propose le premier jour non fait, pas le suivant du dernier fait', () => {
    // Somebody who skipped day 3 should be offered it again, not lose it.
    const progress = courseProgress(MEDITATION, dix, new Set(['decouvrir-meditation-1', 'decouvrir-meditation-2', 'decouvrir-meditation-4']));
    expect(progress.doneCount).toBe(3);
    expect(progress.nextDay?.day).toBe(3);
  });

  it('knows it is finished when every day is done', () => {
    const progress = courseProgress(MEDITATION, dix, new Set(dix.map((d) => d.id)));
    expect(progress.complete).toBe(true);
    expect(progress.nextDay).toBeNull();
  });

  it('does not think it is finished when it is empty', () => {
    // An older build, which does not know this course's days yet.
    const progress = courseProgress(MEDITATION, [], new Set());
    expect(progress.complete).toBe(false);
    expect(progress.days).toEqual([]);
  });
});

describe('ce que le parcours annonce', () => {
  it('invites without counting when nothing has been started', () => {
    expect(courseStatusLabel(courseProgress(MEDITATION, dix, new Set()), MEDITATION)).toBe('10 days, at your own pace');
  });

  it('says where to pick up, never how much is left', () => {
    const progress = courseProgress(MEDITATION, dix, new Set(['decouvrir-meditation-1', 'decouvrir-meditation-2']));
    expect(courseStatusLabel(progress, MEDITATION)).toBe('Day 3 of 10');
  });

  it('congratulates once, soberly', () => {
    const progress = courseProgress(MEDITATION, dix, new Set(dix.map((d) => d.id)));
    expect(courseStatusLabel(progress, MEDITATION)).toBe('Finished · 10 days');
  });
});

describe('les parcours et leur contenu', () => {
  const prefixe = (course: string) => (course === 'mieux-dormir' ? 'parcours-sommeil-j' : 'parcours-meditation-j');

  it('have the ten days claimed, all of them written', () => {
    for (const course of COURSES) {
      const ecrits = Array.from({ length: course.dayCount }, (_, i) => CONTENT_BY_SLUG[`${prefixe(course.slug)}${i + 1}`]);
      expect(ecrits.filter(Boolean)).toHaveLength(course.dayCount);
    }
  });

  it('se retrouvent par leur slug', () => {
    expect(courseBySlug('decouvrir-meditation')?.title).toBe('Discovering meditation');
    expect(courseBySlug('parcours-inexistant')).toBeUndefined();
  });

  it('grow in length without ever passing seven minutes', () => {
    for (const course of COURSES) {
      const durees = Array.from({ length: course.dayCount }, (_, i) =>
        contentDuration(CONTENT_BY_SLUG[`${prefixe(course.slug)}${i + 1}`])
      );
      expect(durees.every((d) => d !== null && d >= 120 && d <= 420)).toBe(true);
      // The progression is gentle: never more than two minutes between one day and the next.
      for (let i = 1; i < durees.length; i += 1) expect(durees[i]! - durees[i - 1]!).toBeLessThanOrEqual(120);
    }
  });
});
