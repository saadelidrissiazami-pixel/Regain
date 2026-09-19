import type { EnergyLevel } from './catalog';

export const QUOTES: Record<'moyen' | 'eleve', string[]> = {
  moyen: [
    "Pas besoin de tout donner aujourd'hui. Un pas suffit.",
    "Une énergie stable, c'est déjà une base solide pour avancer.",
    "Pas besoin d'être au maximum pour avancer un peu.",
  ],
  eleve: [
    "Cette énergie est précieuse : un bon moment pour avancer sur ce qui compte pour toi.",
    "Tu te sens porté·e : profites-en pour une activité qui te fait vraiment envie.",
    "Une belle énergie aujourd'hui. Qu'est-ce que ça te donne envie de faire ?",
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

/** Petites phrases discrètes en bas de l'écran Bien-être. */
export const CALM_QUOTES = [
  'Un petit pas chaque jour fait une grande différence.',
  'Prends le temps d’être ici.',
  'Respirer, c’est déjà prendre soin de soi.',
  'Avancer à ton rythme, c’est avancer quand même.',
];

/** Une phrase par jour, stable dans la journée. */
export function quoteOfTheDay(today: string, list: string[] = CALM_QUOTES): string {
  const seed = today.split('-').reduce((sum, part) => sum + Number(part), 0);
  return list[seed % list.length];
}
