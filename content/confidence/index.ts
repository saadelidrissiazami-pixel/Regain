// Séances de confiance en soi, narrées.
//
// Deux d'entre elles demandent de se lever ou d'agir pour de bon : le silence y devient une
// plage de temps réelle, pas une respiration. Une séance qui dit « fais-le » puis enchaîne dix
// secondes plus tard n'a jamais laissé le temps de le faire.
//
// Le registre évite les formules qu'on se répète sans y croire. On cherche des preuves, pas des
// affirmations.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** Trois qualités — 1 minute, 60 s. */
export const troisQualites: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Une qualité que tes proches te reconnaissent, même si tu la minimises quand on te le dit.",
      speakSeconds: 12,
      silenceSeconds: 8,
    },
    {
      text: "Une qualité que tu as dû développer, qui ne t'était pas naturelle au départ.",
      speakSeconds: 10,
      silenceSeconds: 15,
    },
    {
      text: "Et une chose que tu fais bien sans même y penser.",
      speakSeconds: 10,
      silenceSeconds: 5,
    },
  ],
};

/** Se rappeler une réussite — 3 minutes, 180 s. */
export const seRappelerReussite: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Pense à un moment, même modeste, où tu as accompli quelque chose dont tu étais fier.",
      speakSeconds: 16,
      silenceSeconds: 19,
    },
    {
      text: "Où étais-tu ? Qu'est-ce qu'il avait fallu surmonter pour y arriver ?",
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: "Qu'est-ce que cette réussite dit de toi ? Pas de ta chance ce jour-là — de toi.",
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: "Cette capacité-là est toujours là. Elle ne s'est pas perdue en route.",
      speakSeconds: 12,
      silenceSeconds: 23,
    },
    {
      text: "Tu n'as pas à tout réussir d'un coup. Un pas après l'autre a déjà marché une fois.",
      speakSeconds: 15,
      silenceSeconds: 15,
    },
  ],
};

/** Préparer un moment difficile — 4 minutes, 240 s. */
export const preparationMomentDifficile: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Pense au moment qui approche, celui qui te rend nerveux.",
      speakSeconds: 14,
      silenceSeconds: 16,
    },
    {
      text: "Qu'est-ce que tu redoutes précisément ? Un jugement, un échec, la réaction de quelqu'un ?",
      speakSeconds: 16,
      silenceSeconds: 24,
    },
    {
      text: "Une version de cette peur est-elle déjà arrivée ? Et comment ça s'est passé, vraiment, pas dans le souvenir que tu en gardes ?",
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: "Quelle est la pire issue réaliste ? Pas la pire imaginable : la plus probable si les choses tournent mal.",
      speakSeconds: 18,
      silenceSeconds: 27,
    },
    {
      text: "Tu survivrais à ça. Ce ne serait pas agréable, et tu continuerais quand même.",
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: "Tu n'as pas besoin de te sentir prêt à cent pour cent. Personne ne l'est, et ça se fait quand même.",
      speakSeconds: 20,
      silenceSeconds: 20,
    },
  ],
};

/** Posture de présence — 3 minutes, 180 s. Debout, avec une vraie minute de marche. */
export const postureDePresence: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Mets-toi debout, pieds écartés à peu près à la largeur des épaules. Ne gonfle pas le torse : on ne joue pas un personnage.",
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: "Sens tes pieds sur le sol. Juste ça, quelques secondes.",
      speakSeconds: 10,
      silenceSeconds: 15,
    },
    {
      text: "Épaules relâchées, tête droite, regard à l'horizontale, mâchoire desserrée, respiration lente.",
      speakSeconds: 18,
      silenceSeconds: 12,
    },
    {
      text: "Répète dans ta tête : je n'ai pas besoin d'impressionner. Je peux prendre ma place. Je peux être imparfait et rester digne de respect.",
      speakSeconds: 14,
      silenceSeconds: 11,
    },
    {
      text: "Maintenant, marche tranquillement pendant une minute. Le but n'est pas d'avoir l'air confiant, c'est d'occuper l'espace sans te faire petit.",
      speakSeconds: 12,
      silenceSeconds: 58,
    },
  ],
};

/** Micro-défi social — 7 minutes, 420 s. Avec le temps de faire l'action pour de vrai. */
export const microDefiSocial: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Choisis une petite action sociale légèrement inconfortable : dire bonjour, poser une question, remercier quelqu'un, donner ton avis. Quelque chose de faisable dans les minutes qui viennent.",
      speakSeconds: 20,
      silenceSeconds: 25,
    },
    {
      text: "Avant de la faire, note ton inconfort de zéro à dix. Retiens le chiffre.",
      speakSeconds: 12,
      silenceSeconds: 18,
    },
    {
      text: "Vas-y. Je ne dis plus rien pendant trois minutes. Ne cherche pas à analyser pendant que tu le fais.",
      speakSeconds: 14,
      silenceSeconds: 166,
    },
    {
      text: "C'est fait. Note ton inconfort maintenant, sur la même échelle.",
      speakSeconds: 14,
      silenceSeconds: 46,
    },
    {
      text: "Qu'est-ce que tu pensais qui allait arriver ? Et qu'est-ce qui s'est réellement passé ?",
      speakSeconds: 16,
      silenceSeconds: 44,
    },
    {
      text: "Chaque petit défi accumule une preuve réelle. C'est plus solide que n'importe quel discours pour se rassurer.",
      speakSeconds: 15,
      silenceSeconds: 30,
    },
  ],
};

/** La preuve des trois victoires — 4 minutes, 240 s. */
export const preuveDesTroisVictoires: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Trois victoires d'aujourd'hui. Même minuscules — surtout minuscules.",
      speakSeconds: 14,
      silenceSeconds: 16,
    },
    {
      text: "Une victoire facile, d'abord : quelque chose que tu as simplement réussi à faire.",
      speakSeconds: 12,
      silenceSeconds: 28,
    },
    {
      text: "Une victoire difficile : quelque chose qui t'a demandé un effort, malgré la nervosité.",
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: "Une victoire invisible : quelque chose que personne n'a remarqué. Rester calme alors que tu voulais partir, par exemple.",
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: "Qu'est-ce que tu as appris sur toi aujourd'hui ? Une phrase suffit.",
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: "Répété, ça devient une preuve. Pas un discours : une preuve.",
      speakSeconds: 15,
      silenceSeconds: 20,
    },
  ],
};
