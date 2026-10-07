import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { FR } from '../src/i18n/fr';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry) ? [path] : [];
  });
}

const FILES = ['src', 'app'].flatMap(sourceFiles);

/** The code, without its comments: a `t('…')` quoted in a comment is not a call. */
function code(path: string): string {
  return readFileSync(path, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

describe('the French dictionary', () => {
  it('has a line for every sentence passed to t()', () => {
    const missing: string[] = [];
    for (const path of FILES) {
      for (const match of code(path).matchAll(/\bt\(\s*(['"])((?:\\.|(?!\1).)*)\1/g)) {
        const english = match[2].replace(/\\(['"\\])/g, '$1');
        if (!(english in FR)) missing.push(`${path}: ${english}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('has no line the code no longer asks for', () => {
    // The test above only ever looked for what was missing, so a key outlived its screen in
    // silence: twenty had piled up by the time anyone counted. A dead line is not harmful, but
    // it is read as current by whoever translates the next one.
    const asked = new Set<string>();
    for (const path of FILES) {
      for (const match of code(path).matchAll(/\bt\(\s*(['"])((?:\\.|(?!\1).)*)\1/g)) {
        asked.add(match[2].replace(/\\(['"\\])/g, '$1'));
      }
    }
    expect(Object.keys(FR).filter((english) => !asked.has(english))).toEqual([]);
  });

  it('is looked up with a variable in the places that expect it, and nowhere else', () => {
    // The test above reads the dictionary against the literals it can see, so a key reached only
    // through t(someVariable) looks dead and invites deletion. That failure costs more than the
    // dead lines it prevents: a deleted key breaks a screen in French alone, which is the one
    // place these tests cannot look. So a new dynamic lookup has to land here first, and whoever
    // adds it has to say how its keys stay visible — exerciseByName's do, because every exercise
    // name is also written as a literal in the catalogue it searches.
    const dynamic = FILES.filter((path) => /\bt\(\s*[^'"`)\s]/.test(code(path)) && !path.endsWith('i18n.ts'));
    expect(dynamic).toEqual(['src/features/fitness/exercises.ts']);
  });

  it('is only ever given a plain string, so the test above can read it', () => {
    // A template literal is a different key every time it runs: use t('… {n} …', { n }) instead.
    const offenders = FILES.filter((path) => /\bt\(\s*`/.test(code(path)));
    expect(offenders).toEqual([]);
  });

  it('keeps the same {holes} in both languages', () => {
    const holes = (s: string) => [...s.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort().join();
    const mismatched = Object.entries(FR).filter(([en, fr]) => holes(en) !== holes(fr)).map(([en]) => en);
    expect(mismatched).toEqual([]);
  });
});

describe('the language', () => {
  it('is the first of the phone\'s languages that Regain speaks, holes filled', async () => {
    vi.resetModules();
    vi.doMock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'de' }, { languageCode: 'fr' }] }));
    const { lang, t } = await import('../src/lib/i18n');
    expect(lang).toBe('fr');
    expect(t('in {hours}h {minutes}', { hours: 1, minutes: '05' })).toBe('dans 1 h 05');
    expect(t('A sentence nobody translated')).toBe('A sentence nobody translated');
    vi.doUnmock('expo-localization');
  });
});
