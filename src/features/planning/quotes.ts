import type { EnergyLevel } from './catalog';
import { t } from '../../lib/i18n';

/**
 * What to say back once somebody has told you how their energy is.
 *
 * A low day gets the most care here. The line must not argue with the answer or ask for a better
 * mood in return — somebody who has just said they have nothing left is the last person to hand a
 * pep talk. It acknowledges, and makes the next step small.
 */
export const ENERGY_LINES: Record<EnergyLevel, string[]> = {
  bas: [
    t('A low day is still a day. Nothing here asks you to be at your best.'),
    t('Saying so is already something. What comes next can be small.'),
    t('You have nothing to catch up on today. Small is enough.'),
  ],
  moyen: [
    t('No need to give everything today. One step is enough.'),
    t('Steady energy is already a solid base to build on.'),
    t('You do not have to be at your best to move a little.'),
  ],
  eleve: [
    t('This kind of energy is worth spending on what matters to you.'),
    t('You are carried along today — put it into something you genuinely want to do.'),
    t('A good day to start the thing you keep putting off.'),
  ],
};

/** The line for today. Steady all day, so the card does not change under the person reading it. */
export function lineForEnergy(level: EnergyLevel, today: string): string {
  return quoteOfTheDay(today, ENERGY_LINES[level]);
}

export function isLowEnergy(level: EnergyLevel): boolean {
  return level === 'bas';
}

/** Quiet lines at the foot of the Wellbeing screen. */
export const CALM_QUOTES = [
  t('A small step each day adds up to a great deal.'),
  t('Take the time to be here.'),
  t('Breathing is already a way of looking after yourself.'),
  t('Going at your own pace is still going.'),
];

/** One line a day, steady for the whole day. */
export function quoteOfTheDay(today: string, list: string[] = CALM_QUOTES): string {
  const seed = today.split('-').reduce((sum, part) => sum + Number(part), 0);
  return list[seed % list.length];
}
