import { describe, expect, it } from 'vitest';

import { PERSIST_OPTIONS, shouldPersist } from '../src/lib/queryClient';

/** The shape shouldPersist reads, which is all it reads. */
function query(key: readonly unknown[], status: 'success' | 'error' | 'pending' = 'success') {
  return { queryKey: key, state: { status } } as unknown as Parameters<typeof shouldPersist>[0];
}

describe('what survives a restart', () => {
  it('keeps the answers that make the app usable without network', () => {
    expect(shouldPersist(query(['catalog']))).toBe(true);
    expect(shouldPersist(query(['nutritionLog', 'u1', '2026-10-22']))).toBe(true);
    expect(shouldPersist(query(['activity', 'abc']))).toBe(true);
  });

  it('never keeps the subscription', () => {
    // A persisted `true` would leave a lapsed subscription unlocked for as long as somebody stays
    // offline — a billing hole, and a promise the app cannot keep. It is cheap to re-ask.
    expect(shouldPersist(query(['premium', 'u1']))).toBe(false);
  });

  it('never keeps a failure', () => {
    // Writing an error to disk replays tomorrow as though it were an answer; a day that could not
    // be loaded would come back as a day that is empty.
    expect(shouldPersist(query(['nutritionLog', 'u1'], 'error'))).toBe(false);
    expect(shouldPersist(query(['catalog'], 'pending'))).toBe(false);
  });

  it('throws the cache away after a day, and on a shape change', () => {
    expect(PERSIST_OPTIONS.maxAge).toBe(24 * 60 * 60 * 1000);
    expect(PERSIST_OPTIONS.buster).toBeTruthy();
  });
});
