import type { ProgramContent } from '../../src/features/wellbeing/types';

export const respirationExpress: ProgramContent = {
  type: 'breathing',
  cycles: 3,
  phases: [
    { label: 'Inspirez profondément par le nez', seconds: 4 },
    { label: 'Expirez lentement par la bouche', seconds: 6 },
  ],
};

export const respiration478: ProgramContent = {
  type: 'breathing',
  cycles: 4,
  phases: [
    { label: 'Inspirez par le nez', seconds: 4 },
    { label: 'Retenez votre respiration', seconds: 7 },
    { label: 'Expirez lentement par la bouche', seconds: 8 },
  ],
};

export const coherenceCardiaque: ProgramContent = {
  type: 'breathing',
  cycles: 30,
  phases: [
    { label: 'Inspirez', seconds: 5 },
    { label: 'Expirez', seconds: 5 },
  ],
};

export const respiration46: ProgramContent = {
  type: 'breathing',
  intro: [
    "Installe-toi assis·e ou reste debout. Relâche les épaules. Tu peux garder les yeux ouverts.",
    "Pendant quelques secondes, ne change rien à ta respiration. Observe simplement l'air qui entre, l'air qui sort, le mouvement de ton ventre.",
    "Quand tu es prêt·e, on passe à un rythme plus lent : inspire 4 secondes, expire 6 secondes. L'inspiration reste confortable — c'est l'expiration qui s'allonge un peu.",
  ],
  cycles: 12,
  phases: [
    { label: 'Inspirez doucement par le nez', seconds: 4 },
    { label: 'Expirez lentement en relâchant', seconds: 6 },
  ],
  outro: [
    "Respire normalement pendant encore quelques secondes.",
    "Demande-toi : est-ce que mon corps est un peu plus détendu qu'avant ? Même 5 %, ça compte.",
  ],
};

export const soupirPhysiologique: ProgramContent = {
  type: 'breathing',
  intro: [
    "Cet exercice peut se faire très discrètement, même en public : file d'attente, transports, réunion.",
    "Le principe : une grande inspiration par le nez, suivie d'une toute petite inspiration supplémentaire, puis une longue expiration par la bouche.",
  ],
  cycles: 5,
  phases: [
    { label: 'Grande inspiration par le nez', seconds: 2 },
    { label: 'Petite inspiration supplémentaire', seconds: 1 },
    { label: 'Longue expiration, tout en douceur', seconds: 5 },
  ],
  outro: [
    "Reprends une respiration normale pendant vingt secondes.",
    "Tu peux répéter la séquence un peu plus tard si le besoin s'en fait sentir.",
  ],
};

export const respirationEscalier: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Cet exercice fait progressivement ralentir ta respiration, par paliers.",
    "Niveau 1 : inspire 3 secondes, expire 4 secondes. Fais-le pour environ 5 cycles, à ton rythme.",
    "Niveau 2 : inspire 4 secondes, expire 5 secondes. Encore environ 5 cycles.",
    "Niveau 3 : inspire 4 secondes, expire 6 secondes. Fais 5 à 10 cycles, sans te presser.",
    "Si tu te sens essoufflé·e ou étourdi·e à un moment, arrête de compter et reprends une respiration naturelle. Il n'y a rien à réussir.",
    "Le but n'est pas de battre un record. C'est de sentir que tu peux influencer ton état simplement en ralentissant ta respiration.",
  ],
};
