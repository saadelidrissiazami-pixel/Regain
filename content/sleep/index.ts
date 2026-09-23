// Séances de sommeil, narrées.
//
// Particularité de ce thème : on les écoute au lit, souvent les yeux déjà fermés. Elles se
// terminent donc sans rien réclamer — pas de vibration, pas de bilan à remplir, pas de question.
// C'est le rôle de `endsQuietly`. Seule la première fait exception : elle marque la transition
// avant de se coucher, on est encore debout.
//
// Aucune ne promet l'endormissement. Vérifier si le sommeil arrive est précisément ce qui
// l'empêche, et une séance qui promet crée exactement cette vérification.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** Ralentir avant de dormir — 1 minute, 60 s. Avant le lit : le bilan reste proposé. */
export const ralentirAvantDormir: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Éteins ton écran, ou pose-le loin de toi. C'est le seul geste de cette minute.",
      speakSeconds: 14,
      silenceSeconds: 6,
    },
    {
      text: "Respire une fois, lentement, sans rien changer d'autre.",
      speakSeconds: 12,
      silenceSeconds: 13,
    },
    {
      text: "Tu n'as plus rien à accomplir aujourd'hui. Le reste attendra demain.",
      speakSeconds: 10,
      silenceSeconds: 5,
    },
  ],
};

/** Relâcher les tensions — 3 minutes, 180 s. */
export const relacherTensions: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "Allonge-toi confortablement. Baisse la lumière si tu peux. Tu n'as plus besoin de bien faire quoi que ce soit.",
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: "Laisse tes épaules redescendre. Juste d'un centimètre, ça suffit.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Desserre un peu la mâchoire. C'est souvent là que la journée reste accrochée.",
      speakSeconds: 16,
      silenceSeconds: 19,
    },
    {
      text: "À chaque expiration, la journée s'éloigne un peu plus. Tu n'as pas à l'aider.",
      speakSeconds: 14,
      silenceSeconds: 21,
    },
    {
      text: "Tes jambes sont lourdes, posées. Aucun effort à fournir.",
      speakSeconds: 12,
      silenceSeconds: 18,
    },
    {
      text: "La voix va s'arrêter. Il n'y a plus rien à faire.",
      speakSeconds: 12,
      silenceSeconds: 8,
    },
  ],
};

/** Scan corporel complet — 6 minutes, 360 s. */
export const scanCorporelComplet: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "Allonge-toi et laisse ton corps s'enfoncer dans le matelas. On va le parcourir lentement, sans rien corriger.",
      speakSeconds: 20,
      silenceSeconds: 15,
    },
    {
      text: "Tes pieds. Relâche-les sans les bouger, par la seule intention.",
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: "Remonte vers les jambes. Sens leur poids, et laisse-les se relâcher un peu plus.",
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: "Ton ventre se soulève et redescend, à son rythme, sans ton aide.",
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: "Tes épaules. Elles peuvent descendre encore un peu, même si tu les croyais détendues.",
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: "Ton visage. Le front, le contour des yeux, la mâchoire.",
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: "Sens maintenant ton corps entier, lourd et posé.",
      speakSeconds: 16,
      silenceSeconds: 34,
    },
    {
      text: "C'est fini. Rien à valider, rien à toucher.",
      speakSeconds: 12,
      silenceSeconds: 38,
    },
  ],
};

/** Respiration pour s'endormir — 8 minutes, 480 s. */
export const respirationEndormissement: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "Allonge-toi, baisse la lumière, pose tes mains confortablement.",
      speakSeconds: 20,
      silenceSeconds: 20,
    },
    {
      text: "Pour commencer, respire normalement. Ne change rien, observe seulement.",
      speakSeconds: 16,
      silenceSeconds: 39,
    },
    {
      text: "Maintenant, ralentis un peu : inspire environ quatre secondes, expire environ six. Sans jamais retenir ton souffle. Si c'est inconfortable, reviens à ton rythme naturel.",
      speakSeconds: 22,
      silenceSeconds: 38,
    },
    {
      text: "À chaque expiration, un peu plus lourd. Commence par les pieds.",
      speakSeconds: 12,
      silenceSeconds: 48,
    },
    {
      text: "Les jambes, puis le ventre.",
      speakSeconds: 14,
      silenceSeconds: 51,
    },
    {
      text: "Les épaules.",
      speakSeconds: 12,
      silenceSeconds: 53,
    },
    {
      text: "Le visage.",
      speakSeconds: 12,
      silenceSeconds: 53,
    },
    {
      text: "Si tu as perdu le fil, ce n'est pas grave : personne ne tient huit minutes sans partir ailleurs. La voix s'arrête là.",
      speakSeconds: 15,
      silenceSeconds: 55,
    },
  ],
};

/** Mettre son cerveau en veille — 7 minutes, 420 s. */
export const cerveauEnVeille: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "Ferme les yeux. Ce soir, on ne va rien résoudre. On va seulement ranger.",
      speakSeconds: 22,
      silenceSeconds: 18,
    },
    {
      text: "Imagine une boîte posée à côté de toi. Chaque pensée qui arrive, tu la mets dedans. Tu ne la discutes pas.",
      speakSeconds: 20,
      silenceSeconds: 35,
    },
    {
      text: "Une pensée arrive — « demain, il faut que je… ». Dans la boîte. Pas maintenant, demain.",
      speakSeconds: 18,
      silenceSeconds: 42,
    },
    {
      text: "Une autre — « et si… ». Dans la boîte aussi. Tu ne combats rien, tu ranges.",
      speakSeconds: 20,
      silenceSeconds: 45,
    },
    {
      text: "Continue seul. Chaque fois que tu remarques une pensée, range-la et reviens à ta respiration.",
      speakSeconds: 12,
      silenceSeconds: 58,
    },
    {
      text: "Si une tâche insiste vraiment, tu peux la noter sur un papier à côté du lit. Ton cerveau cesse de la répéter dès qu'il sait qu'elle ne sera pas oubliée.",
      speakSeconds: 20,
      silenceSeconds: 45,
    },
    {
      text: "La boîte reste là. Elle sera encore pleine demain, et ce sera très bien.",
      speakSeconds: 15,
      silenceSeconds: 50,
    },
  ],
};

/** Voyage mental monotone — 7 minutes, 420 s. */
export const voyageMentalMonotone: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "Imagine un endroit calme. Une plage vide, un chemin connu. Surtout pas une histoire captivante.",
      speakSeconds: 20,
      silenceSeconds: 20,
    },
    {
      text: "On cherche la monotonie, pas l'évasion. Des détails qui se répètent : un pas, puis une vague. Un pas, puis une vague.",
      speakSeconds: 18,
      silenceSeconds: 37,
    },
    {
      text: "Je marche. J'entends les vagues. Un pas. Une vague.",
      speakSeconds: 14,
      silenceSeconds: 46,
    },
    {
      text: "Je regarde le sable. Un pas. Une vague.",
      speakSeconds: 12,
      silenceSeconds: 53,
    },
    {
      text: "Continue à ton rythme.",
      speakSeconds: 10,
      silenceSeconds: 60,
    },
    {
      text: "Si ton esprit se met à raconter quelque chose, reviens simplement à : un pas, une vague.",
      speakSeconds: 16,
      silenceSeconds: 49,
    },
    {
      text: "Si les images deviennent floues ou disparaissent, laisse-les partir. Ce n'est pas un échec — c'est souvent le signe que le sommeil approche.",
      speakSeconds: 12,
      silenceSeconds: 53,
    },
  ],
};
