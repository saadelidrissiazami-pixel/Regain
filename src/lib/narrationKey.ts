/**
 * The name a block's audio clip is filed under.
 *
 * Keyed on the text itself rather than on a slug and an index, for two reasons: nothing has to
 * thread an identifier down through the player, and an edited script stops matching its old clip
 * automatically. A missed match falls back to the device voice, which is the right outcome —
 * far better than confidently playing the previous wording.
 *
 * FNV-1a, 32 bits: no dependency, and ample for a few hundred clips.
 * scripts/voice.mjs bundles THIS file, so the two sides cannot drift apart.
 */
export function clipKey(text: string): string {
  let hash = 0x811c9dc5;
  const normalised = text.trim().replace(/\s+/g, ' ');
  for (let i = 0; i < normalised.length; i += 1) {
    hash ^= normalised.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}
