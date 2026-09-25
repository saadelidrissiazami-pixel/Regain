import { describe, expect, it } from 'vitest';

import { clipKey } from '../src/lib/narrationKey';

describe('clipKey', () => {
  it('is stable for the same text', () => {
    expect(clipKey('Installe-toi confortablement.')).toBe(clipKey('Installe-toi confortablement.'));
  });

  it('ignores the whitespace a script can pick up when it is reformatted', () => {
    expect(clipKey('  Deux phrases.   Une pause. ')).toBe(clipKey('Deux phrases. Une pause.'));
  });

  it('changes when a single word changes, so an edited block loses its old clip', () => {
    expect(clipKey('Ferme les yeux.')).not.toBe(clipKey('Ouvre les yeux.'));
  });

  it('is case-sensitive and accent-sensitive: those change how a line is read', () => {
    expect(clipKey('Respire')).not.toBe(clipKey('respire'));
    expect(clipKey('a')).not.toBe(clipKey('à'));
  });

  it('always returns eight hex characters, so a filename is predictable', () => {
    for (const text of ['', 'a', 'Une phrase un peu plus longue, avec de la ponctuation !']) {
      expect(clipKey(text)).toMatch(/^[0-9a-f]{8}$/);
    }
  });
});
