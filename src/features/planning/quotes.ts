import type { EnergyLevel } from './catalog';

export const QUOTES: Record<'moyen' | 'eleve', string[]> = {
  moyen: [
    'No need to give everything today. One step is enough.',
    'Steady energy is already a solid base to build on.',
    'You do not have to be at your best to move a little.',
  ],
  eleve: [
    'This kind of energy is worth spending on what matters to you.',
    'You are carried along today — put it into something you genuinely want to do.',
    'Good energy today. What does it make you want to do?',
  ],
};

export function randomQuote(level: 'moyen' | 'eleve'): string {
  const list = QUOTES[level];
  return list[Math.floor(Math.random() * list.length)];
}

export const LOW_ENERGY_SLUG = 'respiration-4-7-8';

export function isLowEnergy(level: EnergyLevel): boolean {
  return level === 'bas';
}

/** Quiet lines at the foot of the Wellbeing screen. */
export const CALM_QUOTES = [
  'A small step each day adds up to a great deal.',
  'Take the time to be here.',
  'Breathing is already a way of looking after yourself.',
  'Going at your own pace is still going.',
];

/** One line a day, steady for the whole day. */
export function quoteOfTheDay(today: string, list: string[] = CALM_QUOTES): string {
  const seed = today.split('-').reduce((sum, part) => sum + Number(part), 0);
  return list[seed % list.length];
}
