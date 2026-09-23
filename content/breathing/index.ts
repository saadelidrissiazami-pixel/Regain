// Respirations.
//
// Le cœur de ces séances — l'anneau qui se gonfle et se dégonfle au rythme des phases — se
// déroulait déjà tout seul. Ce qui ne se déroulait pas seul, c'était l'introduction : il fallait
// taper « Suivant » deux ou trois fois avant que ça commence, et re-taper à la fin. Les intros et
// les conclusions sont donc devenues des blocs minutés, comme les séances narrées.
//
// Les durées sont calées pour que le total — intro + cycles + conclusion — corresponde à ce que
// le catalogue annonce, ce que tests/catalogue.test.ts vérifie.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** Respiration express — 1 minute : 20 s d'intro, 30 s de cycles, 10 s de conclusion. */
export const respirationExpress: ProgramContent = {
  type: 'breathing',
  intro: [
    {
      text: "Trois respirations, pas plus. Relâche les épaules et laisse ton souffle se placer.",
      speakSeconds: 12,
      silenceSeconds: 8,
    },
  ],
  cycles: 3,
  phases: [
    { label: 'Inspirez profondément par le nez', seconds: 4 },
    { label: 'Expirez lentement par la bouche', seconds: 6 },
  ],
  outro: [{ text: "C'est déjà fini.", speakSeconds: 6, silenceSeconds: 4 }],
};

/** Respiration 4-7-8 — 2 minutes : 30 s d'intro, 76 s de cycles, 14 s de conclusion. */
export const respiration478: ProgramContent = {
  type: 'breathing',
  intro: [
    {
      text: "Quatre cycles : inspire quatre secondes, retiens sept, expire huit. Si retenir te gêne, raccourcis la rétention — il n'y a rien à réussir.",
      speakSeconds: 18,
      silenceSeconds: 12,
    },
  ],
  cycles: 4,
  phases: [
    { label: 'Inspirez par le nez', seconds: 4 },
    { label: 'Retenez votre respiration', seconds: 7 },
    { label: 'Expirez lentement par la bouche', seconds: 8 },
  ],
  outro: [{ text: 'Laisse ta respiration reprendre son rythme.', speakSeconds: 8, silenceSeconds: 6 }],
};

/**
 * Cohérence cardiaque — 5 minutes pile.
 * Six respirations par minute pendant cinq minutes, c'est le protocole ; on n'y ajoute ni intro
 * ni conclusion, qui décaleraient la durée sans rien apporter à des consignes aussi simples.
 */
export const coherenceCardiaque: ProgramContent = {
  type: 'breathing',
  cycles: 30,
  phases: [
    { label: 'Inspirez', seconds: 5 },
    { label: 'Expirez', seconds: 5 },
  ],
};

/** Respiration 4-6 — 4 minutes : 75 s d'intro, 120 s de cycles, 45 s de conclusion. */
export const respiration46: ProgramContent = {
  type: 'breathing',
  intro: [
    {
      text: "Installe-toi assis, ou reste debout. Relâche les épaules. Tu peux garder les yeux ouverts.",
      speakSeconds: 20,
      silenceSeconds: 5,
    },
    {
      text: "D'abord, ne change rien. Observe l'air qui entre, l'air qui sort, le mouvement de ton ventre.",
      speakSeconds: 16,
      silenceSeconds: 9,
    },
    {
      text: "Maintenant, un rythme plus lent : quatre secondes à l'inspiration, six à l'expiration. C'est l'expiration qui s'allonge, pas l'inspiration qui force.",
      speakSeconds: 18,
      silenceSeconds: 7,
    },
  ],
  cycles: 12,
  phases: [
    { label: 'Inspirez doucement par le nez', seconds: 4 },
    { label: 'Expirez lentement en relâchant', seconds: 6 },
  ],
  outro: [
    { text: 'Respire normalement encore quelques secondes.', speakSeconds: 12, silenceSeconds: 11 },
    {
      text: "Ton corps est-il un peu plus détendu qu'avant ? Même cinq pour cent, ça compte.",
      speakSeconds: 12,
      silenceSeconds: 10,
    },
  ],
};

/** Le soupir physiologique — 3 minutes : 80 s d'intro, 40 s de cycles, 60 s de conclusion. */
export const soupirPhysiologique: ProgramContent = {
  type: 'breathing',
  intro: [
    {
      text: "Celle-ci se fait très discrètement, même entouré : file d'attente, transports, réunion. Personne ne remarquera rien.",
      speakSeconds: 20,
      silenceSeconds: 20,
    },
    {
      text: "Le principe : une grande inspiration par le nez, puis une toute petite inspiration par-dessus, puis une longue expiration par la bouche.",
      speakSeconds: 22,
      silenceSeconds: 18,
    },
  ],
  cycles: 5,
  phases: [
    { label: 'Grande inspiration par le nez', seconds: 2 },
    { label: 'Petite inspiration supplémentaire', seconds: 1 },
    { label: 'Longue expiration, tout en douceur', seconds: 5 },
  ],
  outro: [
    { text: 'Reprends une respiration normale.', speakSeconds: 12, silenceSeconds: 18 },
    {
      text: "Tu peux refaire la séquence plus tard dans la journée, autant de fois que nécessaire.",
      speakSeconds: 14,
      silenceSeconds: 16,
    },
  ],
};

/** La respiration en escalier — 6 minutes, 360 s. Trois paliers, sans compte à rebours. */
export const respirationEscalier: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "On va ralentir ta respiration par paliers. Trois niveaux, de plus en plus lents. Compte dans ta tête, à ton rythme.",
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: "Niveau un : inspire trois secondes, expire quatre. Environ cinq cycles.",
      speakSeconds: 16,
      silenceSeconds: 39,
    },
    {
      text: "Niveau deux : inspire quatre, expire cinq. Encore cinq cycles environ.",
      speakSeconds: 14,
      silenceSeconds: 51,
    },
    {
      text: "Niveau trois : inspire quatre, expire six. Reste là aussi longtemps que c'est confortable.",
      speakSeconds: 16,
      silenceSeconds: 84,
    },
    {
      text: "Si tu te sens essoufflé ou étourdi, arrête de compter et reviens à ta respiration naturelle. C'est la bonne réaction, pas un abandon.",
      speakSeconds: 18,
      silenceSeconds: 32,
    },
    {
      text: "Le but n'est pas de battre un record. C'est de constater que tu peux changer ton état en ralentissant, et que ce levier reste disponible.",
      speakSeconds: 20,
      silenceSeconds: 40,
    },
  ],
};
