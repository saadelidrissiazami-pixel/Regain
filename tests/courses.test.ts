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
// Une séance ordinaire, qui ne doit jamais se retrouver dans un parcours.
const horsParcours: WellbeingProgram = { ...day(MEDITATION.slug, 99), course_slug: null, course_day: null };

describe('avancement d un parcours', () => {
  it('range les jours dans l ordre, quel que soit celui de la base', () => {
    const melange = [dix[4], dix[0], dix[9], dix[2]];
    expect(courseProgress(MEDITATION, melange, new Set()).days.map((d) => d.day)).toEqual([1, 3, 5, 10]);
  });

  it('ignore les séances qui n appartiennent pas au parcours', () => {
    expect(courseProgress(MEDITATION, [...dix, horsParcours], new Set()).days).toHaveLength(10);
  });

  it('propose le jour 1 quand rien n est fait', () => {
    const progress = courseProgress(MEDITATION, dix, new Set());
    expect(progress.doneCount).toBe(0);
    expect(progress.nextDay?.day).toBe(1);
    expect(progress.complete).toBe(false);
  });

  it('propose le premier jour non fait, pas le suivant du dernier fait', () => {
    // Quelqu'un qui a sauté le jour 3 doit se le voir reproposer, pas le perdre.
    const progress = courseProgress(MEDITATION, dix, new Set(['decouvrir-meditation-1', 'decouvrir-meditation-2', 'decouvrir-meditation-4']));
    expect(progress.doneCount).toBe(3);
    expect(progress.nextDay?.day).toBe(3);
  });

  it('se sait terminé quand tous les jours sont faits', () => {
    const progress = courseProgress(MEDITATION, dix, new Set(dix.map((d) => d.id)));
    expect(progress.complete).toBe(true);
    expect(progress.nextDay).toBeNull();
  });

  it('ne se croit pas terminé quand il est vide', () => {
    // Une application plus ancienne, qui ne connaît pas encore les jours de ce parcours.
    const progress = courseProgress(MEDITATION, [], new Set());
    expect(progress.complete).toBe(false);
    expect(progress.days).toEqual([]);
  });
});

describe('ce que le parcours annonce', () => {
  it('invite sans chiffrer quand on n a rien commencé', () => {
    expect(courseStatusLabel(courseProgress(MEDITATION, dix, new Set()), MEDITATION)).toBe('10 jours, à ton rythme');
  });

  it('dit où reprendre, jamais combien il reste', () => {
    const progress = courseProgress(MEDITATION, dix, new Set(['decouvrir-meditation-1', 'decouvrir-meditation-2']));
    expect(courseStatusLabel(progress, MEDITATION)).toBe('Jour 3 sur 10');
  });

  it('se félicite une fois, sobrement', () => {
    const progress = courseProgress(MEDITATION, dix, new Set(dix.map((d) => d.id)));
    expect(courseStatusLabel(progress, MEDITATION)).toBe('Terminé · 10 jours');
  });
});

describe('les parcours et leur contenu', () => {
  const prefixe = (course: string) => (course === 'mieux-dormir' ? 'parcours-sommeil-j' : 'parcours-meditation-j');

  it('ont les dix jours annoncés, tous écrits', () => {
    for (const course of COURSES) {
      const ecrits = Array.from({ length: course.dayCount }, (_, i) => CONTENT_BY_SLUG[`${prefixe(course.slug)}${i + 1}`]);
      expect(ecrits.filter(Boolean)).toHaveLength(course.dayCount);
    }
  });

  it('se retrouvent par leur slug', () => {
    expect(courseBySlug('decouvrir-meditation')?.title).toBe('Découvrir la méditation');
    expect(courseBySlug('parcours-inexistant')).toBeUndefined();
  });

  it('montent en durée sans jamais dépasser sept minutes', () => {
    for (const course of COURSES) {
      const durees = Array.from({ length: course.dayCount }, (_, i) =>
        contentDuration(CONTENT_BY_SLUG[`${prefixe(course.slug)}${i + 1}`])
      );
      expect(durees.every((d) => d !== null && d >= 120 && d <= 420)).toBe(true);
      // La progression est douce : jamais plus de deux minutes d'écart d'un jour au suivant.
      for (let i = 1; i < durees.length; i += 1) expect(durees[i]! - durees[i - 1]!).toBeLessThanOrEqual(120);
    }
  });
});
