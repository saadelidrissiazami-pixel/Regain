/**
 * Where a touch lands on a track, as a fraction of its width.
 *
 * Its own file, with no imports: the slider it belongs to pulls in the icon font, and this is
 * the only part of it worth reading back in a test.
 */
export function at(locationX: number, width: number): number {
  // onLayout has not fired on the first touch of a fresh screen. Dividing by zero there would
  // hand the players NaN, and NaN silences everything.
  if (width <= 0) return 0.5;
  return Math.min(1, Math.max(0, locationX / width));
}
