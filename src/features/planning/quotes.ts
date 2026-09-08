import type { EnergyLevel } from './catalog';

export const QUOTES: Record<'moyen' | 'eleve', string[]> = {
  moyen: [
    "Vous n'avez pas besoin de tout donner aujourd'hui. Un pas suffit.",
    "Une énergie stable, c'est déjà une base solide pour avancer.",
    "Pas besoin d'être au maximum pour avancer un peu.",
  ],
  eleve: [
    "Cette énergie est précieuse — un bon moment pour avancer sur ce qui compte pour vous.",
    "Vous vous sentez porté·e : profitez-en pour une activité qui vous fait vraiment envie.",
    "Une belle énergie aujourd'hui. Qu'est-ce que ça vous donne envie de faire ?",
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
