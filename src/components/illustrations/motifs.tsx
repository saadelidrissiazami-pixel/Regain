import type { ReactElement } from 'react';
import { Circle, Ellipse, Path, Rect } from 'react-native-svg';

/**
 * One drawing per activity, in a 64×64 box.
 *
 * These replace the photographs that were planned and never generated. A drawing turned out to be
 * the better answer anyway: a photograph of a bench says "a bench", while "sit outside for a few
 * minutes" is about the sitting. A line drawing can show the *gesture* — a boundary being drawn, a
 * screen going dark, a loop that returns home — which is what the person is actually being asked
 * to do.
 *
 * Everything stays inside y 16‥48, because the detail header crops this square to roughly 1.9:1
 * and anything above or below that band is cut off.
 */
export type MotifPalette = {
  /** The drawing's own line. */
  line: string;
  /** The category's colour, spent on the one element that carries the meaning. */
  accent: string;
  /** A wash, for the few shapes that read better filled. */
  soft: string;
};

type Motif = (p: MotifPalette) => ReactElement;

const S = { strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

export const MOTIFS: Record<string, Motif> = {
  // — physique ————————————————————————————————————————————————————
  'move-to-one-song': (p) => (
    <>
      <Rect x={20} y={26} width={11} height={16} rx={2.5} stroke={p.line} {...S} />
      <Circle cx={25.5} cy={34} r={3} stroke={p.line} {...S} />
      <Path d="M36 29q4.5 5 0 10M41 25.5q8 8.5 0 17" stroke={p.accent} {...S} />
    </>
  ),
  'walk-around-indoors': (p) => (
    <>
      <Ellipse cx={24} cy={40} rx={3} ry={4.5} stroke={p.line} {...S} />
      <Ellipse cx={31} cy={32} rx={3} ry={4.5} stroke={p.line} {...S} />
      <Ellipse cx={38} cy={24} rx={3} ry={4.5} stroke={p.accent} {...S} />
      <Path d="M18 46h28" stroke={p.line} strokeWidth={1.5} strokeLinecap="round" opacity={0.45} />
    </>
  ),
  'loosen-your-hands-and-shoulders': (p) => (
    <>
      <Path d="M24 24a11 11 0 1 0 0 16" stroke={p.line} {...S} />
      <Path d="M40 40a11 11 0 1 0 0-16" stroke={p.accent} {...S} />
      <Path d="M24 20v4.5h4.5M40 44v-4.5h-4.5" stroke={p.accent} {...S} />
    </>
  ),
  'take-a-short-loop-outside': (p) => (
    <>
      <Path d="M32 42c-9 0-14-4-14-9s5-9 14-9 14 4 14 9-5 9-14 9" stroke={p.line} strokeDasharray="3 4" {...S} />
      <Circle cx={32} cy={42} r={3} fill={p.accent} />
    </>
  ),
  'dance-to-two-songs': (p) => (
    <>
      <Path d="M26 40V22l14-3v18" stroke={p.line} {...S} />
      <Circle cx={23} cy={40} r={3.2} stroke={p.accent} {...S} />
      <Circle cx={37} cy={37} r={3.2} stroke={p.accent} {...S} />
    </>
  ),
  'walk-thirty-minutes-picking-up-the-pace': (p) => (
    <>
      <Path d="M18 40l5-5-5-5" stroke={p.line} {...S} opacity={0.45} />
      <Path d="M28 42l7-7-7-7" stroke={p.line} {...S} opacity={0.75} />
      <Path d="M39 44l9-9-9-9" stroke={p.accent} {...S} />
    </>
  ),

  // — outdoor —————————————————————————————————————————————————————
  'step-out-just-outside': (p) => (
    <>
      <Rect x={20} y={18} width={16} height={28} rx={2} stroke={p.line} {...S} />
      <Path d="M36 22l9 5v14l-9 5z" stroke={p.accent} {...S} fill={p.soft} />
      <Circle cx={33} cy={33} r={1.4} fill={p.line} />
    </>
  ),
  'spot-three-details-outside': (p) => (
    <>
      <Circle cx={30} cy={30} r={11} stroke={p.line} {...S} />
      <Path d="M38 38l8 8" stroke={p.line} {...S} />
      <Circle cx={26} cy={30} r={1.8} fill={p.accent} />
      <Circle cx={31} cy={27} r={1.8} fill={p.accent} />
      <Circle cx={33} cy={34} r={1.8} fill={p.accent} />
    </>
  ),
  'sit-outside-for-a-few-minutes': (p) => (
    <>
      <Path d="M17 34h30M19 34v10M45 34v10" stroke={p.line} {...S} />
      <Path d="M20 30h24M20 26h24" stroke={p.accent} {...S} />
      <Path d="M20 26v8M44 26v8" stroke={p.line} {...S} />
    </>
  ),
  'walk-to-some-greenery': (p) => (
    <>
      <Path d="M32 46V30" stroke={p.line} {...S} />
      <Path d="M32 34c-7 0-10-4-10-8 5-1 10 2 10 8" stroke={p.accent} {...S} fill={p.soft} />
      <Path d="M32 30c0-6 4-10 10-9 1 5-3 9-10 9" stroke={p.accent} {...S} fill={p.soft} />
    </>
  ),
  'walk-a-loop-near-home': (p) => (
    <>
      <Path d="M32 44c-10 0-15-4-15-9s5-9 15-9 15 4 15 9" stroke={p.line} strokeDasharray="3 4" {...S} />
      <Path d="M26 24l6-5 6 5v7h-12z" stroke={p.accent} {...S} fill={p.soft} />
    </>
  ),
  'find-a-street-you-never-take': (p) => (
    <>
      <Path d="M30 46V34l-9-9" stroke={p.line} {...S} opacity={0.5} />
      <Path d="M34 46V34l10-11" stroke={p.accent} {...S} />
      <Circle cx={44} cy={21} r={2.6} fill={p.accent} />
    </>
  ),

  // — indoor ——————————————————————————————————————————————————————
  'clear-one-corner-of-a-table': (p) => (
    <>
      <Path d="M16 38h32M22 38v8" stroke={p.line} {...S} />
      <Rect x={20} y={28} width={9} height={8} rx={1.5} stroke={p.line} {...S} opacity={0.45} />
      <Rect x={33} y={26} width={11} height={10} rx={1.5} stroke={p.accent} strokeDasharray="3 3" {...S} />
      <Path d="M30 24q5-4 10 0" stroke={p.accent} {...S} />
      <Path d="M40 24h-4.5v-4" stroke={p.accent} {...S} />
    </>
  ),
  'put-five-things-back': (p) => (
    <>
      <Path d="M17 38h30" stroke={p.line} {...S} />
      <Rect x={19} y={31} width={6} height={7} stroke={p.line} {...S} />
      <Rect x={27} y={29} width={6} height={9} stroke={p.line} {...S} />
      <Rect x={35} y={32} width={6} height={6} stroke={p.line} {...S} />
      <Rect x={39} y={19} width={6} height={6} rx={1} stroke={p.accent} {...S} />
      <Path d="M42 27v-2" stroke={p.accent} {...S} />
    </>
  ),
  'set-up-a-comfortable-spot': (p) => (
    <>
      <Path d="M22 40V28a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v12" stroke={p.line} {...S} />
      <Path d="M17 44v-7a3 3 0 0 1 5 0M47 44v-7a3 3 0 0 0-5 0" stroke={p.line} {...S} />
      <Path d="M17 44h30" stroke={p.line} {...S} />
      <Path d="M27 34h10v4H27z" stroke={p.accent} {...S} fill={p.soft} />
    </>
  ),
  'find-something-you-care-about': (p) => (
    <>
      <Path d="M20 30h24v14H20z" stroke={p.line} {...S} />
      <Path d="M20 30l4-6h16l4 6" stroke={p.line} {...S} />
      <Path d="M32 24v-5M28 21l-2-3M36 21l2-3" stroke={p.accent} {...S} />
    </>
  ),
  'make-something-warm': (p) => (
    <>
      <Rect x={21} y={30} width={18} height={14} rx={3} stroke={p.line} {...S} />
      <Path d="M39 34h3a4 4 0 0 1 0 8h-3" stroke={p.line} {...S} />
      <Path d="M27 26q3-4 0-7M34 26q3-4 0-7" stroke={p.accent} {...S} />
    </>
  ),

  // — social ——————————————————————————————————————————————————————
  'send-a-small-hello': (p) => (
    <>
      <Path d="M18 24h28v16H28l-7 6v-6h-3z" stroke={p.line} {...S} />
      <Circle cx={32} cy={32} r={1.8} fill={p.accent} />
    </>
  ),
  'offer-a-short-call': (p) => (
    <>
      <Path d="M17 23h30v18H30l-7 5v-5h-6z" stroke={p.line} {...S} />
      <Path d="M27 28l3 3-1.5 2a8 8 0 0 0 3.5 3.5l2-1.5 3 3-2 2c-4.5 0-9.5-5-9.5-9.5z" stroke={p.accent} {...S} />
    </>
  ),
  'send-a-voice-note': (p) => (
    <>
      <Path d="M20 30v4M25 26v12M30 22v20M35 27v10M40 31v2M44 29v6" stroke={p.line} {...S} />
      <Path d="M30 22v20" stroke={p.accent} {...S} />
    </>
  ),
  'call-for-ten-minutes': (p) => (
    <>
      <Path d="M20 24l5 4-2 4a14 14 0 0 0 6 6l4-2 4 5-3 3c-8 1-17-9-16-16z" stroke={p.line} {...S} />
      <Circle cx={41} cy={23} r={6} stroke={p.accent} {...S} />
      <Path d="M41 20v3h2.5" stroke={p.accent} {...S} />
    </>
  ),
  'share-a-drink': (p) => (
    <>
      <Path d="M22 28h10l-1.5 14h-7z" stroke={p.line} {...S} />
      <Path d="M35 28h10l-1.5 14h-7z" stroke={p.accent} {...S} />
      <Path d="M22 33h9M35 33h9" stroke={p.line} strokeWidth={1.5} opacity={0.5} />
    </>
  ),
  'write-to-someone-you-have-lost-touch-with': (p) => (
    <>
      <Rect x={17} y={24} width={30} height={19} rx={2} stroke={p.line} {...S} />
      <Path d="M17 26l15 11 15-11" stroke={p.accent} {...S} />
    </>
  ),

  // — relaxation ——————————————————————————————————————————————————
  'listen-to-one-song-doing-nothing': (p) => (
    <>
      <Path d="M20 36v-3a12 12 0 0 1 24 0v3" stroke={p.line} {...S} />
      <Rect x={16} y={34} width={7} height={11} rx={3.5} stroke={p.accent} {...S} />
      <Rect x={41} y={34} width={7} height={11} rx={3.5} stroke={p.accent} {...S} />
    </>
  ),
  'warm-cloth-over-your-hands': (p) => (
    <>
      <Path d="M19 32h26v7q-6.5 4-13 0t-13 0z" stroke={p.line} {...S} fill={p.soft} />
      <Path d="M19 36h26" stroke={p.line} strokeWidth={1.5} opacity={0.4} />
      <Path d="M26 27q3-4 0-7M34 27q3-4 0-7" stroke={p.accent} {...S} />
    </>
  ),
  'unclench-your-hands-and-jaw': (p) => (
    <>
      <Rect x={26} y={26} width={13} height={13} rx={4} stroke={p.line} {...S} fill={p.soft} />
      <Path d="M21 32.5h-5M19 29l-3 3.5 3 3.5" stroke={p.accent} {...S} />
      <Path d="M44 32.5h5M46 29l3 3.5-3 3.5" stroke={p.accent} {...S} />
    </>
  ),
  'look-out-of-the-window': (p) => (
    <>
      <Rect x={20} y={18} width={24} height={28} rx={2} stroke={p.line} {...S} />
      <Path d="M32 18v28M20 32h24" stroke={p.line} {...S} />
      <Circle cx={38} cy={25} r={3} fill={p.accent} opacity={0.75} />
    </>
  ),
  'take-an-unhurried-shower': (p) => (
    <>
      <Path d="M24 22h16a0 0 0 0 1 0 0 8 8 0 0 1-16 0" stroke={p.line} {...S} />
      <Path d="M32 22v-4" stroke={p.line} {...S} />
      <Path d="M26 32v4M32 34v5M38 32v4" stroke={p.accent} {...S} />
    </>
  ),

  // — meditation ——————————————————————————————————————————————————
  'feel-one-point-of-contact': (p) => (
    <>
      <Path d="M16 42h32" stroke={p.line} {...S} />
      <Circle cx={32} cy={42} r={3} fill={p.accent} />
      <Path d="M25 36a9 9 0 0 1 14 0" stroke={p.line} {...S} opacity={0.55} />
      <Path d="M21 30a15 15 0 0 1 22 0" stroke={p.line} {...S} opacity={0.3} />
    </>
  ),
  'listen-to-the-sounds-around-you': (p) => (
    <>
      <Circle cx={32} cy={33} r={3} fill={p.accent} />
      <Path d="M25 28a9 9 0 0 0 0 10M39 28a9 9 0 0 1 0 10" stroke={p.line} {...S} />
      <Path d="M20 24a16 16 0 0 0 0 18M44 24a16 16 0 0 1 0 18" stroke={p.line} {...S} opacity={0.45} />
    </>
  ),
  'watch-a-few-breaths': (p) => (
    <>
      <Circle cx={32} cy={33} r={13} stroke={p.line} {...S} opacity={0.35} />
      <Circle cx={32} cy={33} r={8} stroke={p.accent} {...S} />
      <Circle cx={32} cy={33} r={3} fill={p.accent} opacity={0.5} />
    </>
  ),
  'come-back-to-one-sensation': (p) => (
    <>
      <Path d="M32 46c8 0 14-6 14-13S40 20 33 20s-11 5-11 10 4 8 8 8 6-3 6-6-2-4-4-4" stroke={p.line} {...S} />
      <Circle cx={32} cy={32} r={2.4} fill={p.accent} />
    </>
  ),

  // — dev_perso ———————————————————————————————————————————————————
  'note-one-good-thing': (p) => (
    <>
      <Rect x={21} y={19} width={22} height={27} rx={2} stroke={p.line} {...S} />
      <Path d="M26 19v27" stroke={p.line} {...S} opacity={0.4} />
      <Path d="M32 27l2 4 4 .5-3 3 .8 4-3.8-2-3.8 2 .8-4-3-3 4-.5z" fill={p.accent} />
    </>
  ),
  'name-what-you-need': (p) => (
    <>
      <Path d="M28 22h16a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H28l-11-10z" stroke={p.line} {...S} />
      <Circle cx={26} cy={32} r={2.4} stroke={p.accent} {...S} />
      <Path d="M34 28h9M34 36h6" stroke={p.accent} {...S} />
    </>
  ),
  'set-one-thing-up-for-tomorrow': (p) => (
    <>
      <Path d="M16 40h32" stroke={p.line} {...S} />
      <Path d="M24 40a8 8 0 0 1 16 0" stroke={p.accent} {...S} fill={p.soft} />
      <Path d="M32 26v-4M22 29l-2-2M42 29l2-2" stroke={p.accent} {...S} opacity={0.7} />
    </>
  ),
  // The hard one: a notebook would read the same as four other activities in this category.
  // What distinguishes it is the limit itself — a line that stops something.
  'write-one-sentence-that-sets-a-limit': (p) => (
    <>
      <Path d="M42 18v28" stroke={p.accent} strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M18 32h20" stroke={p.line} {...S} />
      <Path d="M33 27l6 2-2 6" stroke={p.line} {...S} opacity={0.45} />
      <Path d="M22 43l3-7 3 1z" fill={p.line} opacity={0.6} />
    </>
  ),
  'look-back-at-what-you-have-done': (p) => (
    <>
      <Path d="M22 24h22M22 32h22M22 40h14" stroke={p.line} {...S} opacity={0.5} />
      <Path d="M17 23l2 2 3-4M17 31l2 2 3-4" stroke={p.accent} {...S} />
      <Path d="M17 40h2" stroke={p.line} {...S} opacity={0.4} />
    </>
  ),

  // — recuperation ————————————————————————————————————————————————
  'rest-without-trying-to-sleep': (p) => (
    <>
      <Path d="M17 40q15-9 30 0v4H17z" stroke={p.line} {...S} fill={p.soft} />
      <Path d="M22 26q10-9 20 0q-10 9-20 0z" stroke={p.accent} {...S} />
      <Circle cx={32} cy={26} r={2.4} fill={p.accent} />
    </>
  ),
  'take-a-screen-free-break': (p) => (
    <>
      <Rect x={18} y={22} width={28} height={19} rx={2} stroke={p.line} {...S} fill={p.soft} />
      <Path d="M27 45h10" stroke={p.line} {...S} />
      <Path d="M22 38l20-14" stroke={p.accent} {...S} />
    </>
  ),
  'rest-your-legs': (p) => (
    <>
      <Rect x={36} y={26} width={12} height={9} rx={3} stroke={p.line} {...S} fill={p.soft} />
      <Path d="M16 40h20l5-5M16 45h18l4-4" stroke={p.accent} {...S} />
      <Path d="M16 40v5" stroke={p.accent} {...S} />
    </>
  ),
  'switch-to-a-softer-light': (p) => (
    <>
      <Path d="M24 32l5-11h6l5 11z" stroke={p.line} {...S} fill={p.soft} />
      <Path d="M32 32v12" stroke={p.line} {...S} />
      <Path d="M20 38q12 6 24 0" stroke={p.accent} {...S} opacity={0.6} />
    </>
  ),
  'take-five-minutes-with-no-task': (p) => (
    <>
      <Circle cx={32} cy={33} r={12} stroke={p.line} {...S} />
      <Circle cx={32} cy={33} r={2.2} fill={p.accent} />
      <Path d="M32 21v2M44 33h-2M32 45v-2M20 33h2" stroke={p.line} {...S} opacity={0.5} />
    </>
  ),

  // — temps_libre —————————————————————————————————————————————————
  'read-two-pages': (p) => (
    <>
      <Path d="M32 26v18" stroke={p.accent} {...S} />
      <Path d="M32 26q-7-5-15-3v18q8-2 15 3q7-5 15-3V23q-8-2-15 3z" stroke={p.line} {...S} />
    </>
  ),
  'draw-with-nothing-to-copy': (p) => (
    <>
      <Path d="M18 44l3-7 15-15 4 4-15 15z" stroke={p.line} {...S} />
      <Path d="M36 22l4 4" stroke={p.line} {...S} />
      <Path d="M30 44q6-8 12-2t4-8" stroke={p.accent} {...S} />
    </>
  ),
  'do-a-few-jigsaw-pieces': (p) => (
    <>
      <Path d="M18 22h10a3 3 0 0 1 6 0h10v10a3 3 0 0 0 0 6v6H18z" stroke={p.line} {...S} />
      <Path d="M44 38a3 3 0 0 1 0-6V22h-6" stroke={p.accent} {...S} opacity={0.8} />
    </>
  ),
  'listen-to-a-short-story': (p) => (
    <>
      <Path d="M20 24q6-3 12 0v18q-6-3-12 0z" stroke={p.line} {...S} />
      <Path d="M36 28q4 5 0 10M41 24q8 9 0 18" stroke={p.accent} {...S} />
    </>
  ),
  'read-a-few-pages-of-a-comic': (p) => (
    <>
      <Rect x={18} y={20} width={28} height={24} rx={2} stroke={p.line} {...S} />
      <Path d="M18 32h28M32 20v12" stroke={p.line} {...S} opacity={0.5} />
      <Path d="M24 40h8l-3 4z" fill={p.accent} />
    </>
  ),
  'watch-one-episode-on-purpose': (p) => (
    <>
      <Rect x={17} y={22} width={30} height={20} rx={2} stroke={p.line} {...S} />
      <Path d="M27 46h10" stroke={p.line} {...S} />
      <Path d="M29 27l9 5-9 5z" fill={p.accent} />
    </>
  ),
};
