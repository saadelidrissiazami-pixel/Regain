import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

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
