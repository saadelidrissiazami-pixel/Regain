// Séances d'écriture, narrées.
//
// Ici le silence n'est pas une respiration : c'est le temps d'écrire. Il est donc nettement plus
// long qu'ailleurs, et c'est voulu — une question posée puis suivie de huit secondes est une
// question qu'on n'a pas le temps de se poser.
//
// Les séances demandent une feuille ou l'application Notes, et le disent d'entrée.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** Gratitude express — 1 minute, 60 s. */
export const gratitudeExpress: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Une seule question, et tu n'as même pas besoin de l'écrire. Quelle petite chose agréable s'est produite aujourd'hui ?",
      speakSeconds: 12,
      silenceSeconds: 8,
    },
    {
      text: "Qui ou quoi t'a aidé, même un peu, même sans le savoir ?",
      speakSeconds: 10,
      silenceSeconds: 15,
    },
    {
      text: "Garde ça pour toi. C'était le but.",
      speakSeconds: 10,
      silenceSeconds: 5,
    },
  ],
};

/** Clarifier sa journée — 3 minutes, 180 s. */
export const clarifierJournee: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Repense à ta journée, sans la juger. On va juste la regarder.",
      speakSeconds: 16,
      silenceSeconds: 9,
    },
    {
      text: "Qu'est-ce qui a pris le plus de place aujourd'hui ? Dans ton temps, ou dans ta tête — les deux ne sont pas toujours la même chose.",
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: "Y a-t-il eu un moment, même minuscule, qui t'a fait du bien ?",
      speakSeconds: 12,
      silenceSeconds: 28,
    },
    {
      text: "Qu'est-ce que tu ferais autrement demain, si l'occasion se représentait ?",
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: "Tu n'as rien à noter. Laisse simplement ces réponses infuser.",
      speakSeconds: 15,
      silenceSeconds: 20,
    },
  ],
};

/** Vider sa tête — 4 minutes, 240 s. */
export const viderSaTete: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Si ta tête est pleine, ce moment sert à en sortir un peu. Pas à tout résoudre.",
      speakSeconds: 18,
      silenceSeconds: 12,
    },
    {
      text: "Qu'est-ce qui tourne en boucle depuis un moment ?",
      speakSeconds: 12,
      silenceSeconds: 28,
    },
    {
      text: "Est-ce une chose à faire, une chose à décider, ou juste une chose à ressentir ? Les trois ne se traitent pas pareil.",
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: "Si c'est à faire : quelle serait la toute première petite étape ? Pas le plan, juste la première étape.",
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: "Si c'est à décider : qu'est-ce qui te manque ? Du temps, une information, l'avis de quelqu'un ? Et si c'est juste un ressenti, il n'a pas besoin d'être réglé — seulement remarqué.",
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: "Une dernière question. Dans tout ça, qu'est-ce qui ne t'appartient pas vraiment à porter ?",
      speakSeconds: 15,
      silenceSeconds: 25,
    },
  ],
};

/** Le déchargement mental — 7 minutes, 420 s. Avec une vraie plage d'écriture libre. */
export const dechargementMental: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Pour celle-ci, il te faut une feuille ou l'application Notes. Prends-la maintenant, je t'attends.",
      speakSeconds: 20,
      silenceSeconds: 15,
    },
    {
      text: "Tu vas écrire tout ce qui te traverse l'esprit. Sans grammaire, sans structure, sans relire. Même « je ne sais pas quoi écrire » compte, et tu continues.",
      speakSeconds: 18,
      silenceSeconds: 12,
    },
    {
      text: "C'est parti. Écris sans t'arrêter, je ne dirai plus rien pendant trois minutes.",
      speakSeconds: 12,
      silenceSeconds: 168,
    },
    {
      text: "Arrête-toi. Relis, et sépare ce que tu as écrit en deux : ce qui est sous ton contrôle, et ce qui ne l'est pas. Tes décisions et tes actions le sont. Le passé et les réactions des autres, non.",
      speakSeconds: 20,
      silenceSeconds: 40,
    },
    {
      text: "Dans la colonne « sous mon contrôle », choisis une seule action. Une seule. Par exemple : envoyer ce message.",
      speakSeconds: 18,
      silenceSeconds: 32,
    },
    {
      text: "Tu peux jeter la feuille. Ce qui comptait, c'est que ce soit sorti de ta tête.",
      speakSeconds: 15,
      silenceSeconds: 50,
    },
  ],
};

/** Journal de confiance — 6 minutes, 360 s. */
export const journalDeConfiance: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Cinq questions. Une phrase par réponse suffit, dans ta tête ou sur papier.",
      speakSeconds: 18,
      silenceSeconds: 12,
    },
    {
      text: "Qu'as-tu fait aujourd'hui malgré une difficulté ? Même tout petit. Surtout tout petit.",
      speakSeconds: 14,
      silenceSeconds: 46,
    },
    {
      text: "Quelle situation as-tu mieux gérée que tu ne l'aurais fait il y a un an ?",
      speakSeconds: 14,
      silenceSeconds: 46,
    },
    {
      text: "Qu'est-ce que ça dit de toi ? Par exemple : je suis capable de continuer même quand c'est inconfortable.",
      speakSeconds: 16,
      silenceSeconds: 54,
    },
    {
      text: "Quel petit acte de courage as-tu posé ? Poser une question, dire non, essayer quelque chose de nouveau.",
      speakSeconds: 16,
      silenceSeconds: 54,
    },
    {
      text: "Et pour finir : quelle chose petite et réalisable vas-tu oser demain ?",
      speakSeconds: 15,
      silenceSeconds: 55,
    },
  ],
};

/** Mettre la peur en plan — 8 minutes, 480 s. */
export const peurEnPlan: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "De quoi as-tu peur, précisément ? Prends le temps de le formuler, même si c'est désagréable.",
      speakSeconds: 14,
      silenceSeconds: 41,
    },
    {
      text: "Quel est le scénario catastrophe que ton cerveau fabrique ? Sois précis. Les peurs vagues sont les plus lourdes à porter.",
      speakSeconds: 16,
      silenceSeconds: 49,
    },
    {
      text: "Quelle est la probabilité réelle que ça arrive ? Pas besoin d'un chiffre juste, une intuition honnête suffit.",
      speakSeconds: 16,
      silenceSeconds: 49,
    },
    {
      text: "Si ça arrivait quand même, que pourrais-tu faire ? Cherche trois possibilités, même imparfaites.",
      speakSeconds: 18,
      silenceSeconds: 62,
    },
    {
      text: "Qu'est-ce qui est réellement sous ton contrôle dans cette situation ?",
      speakSeconds: 16,
      silenceSeconds: 54,
    },
    {
      text: "Et qu'est-ce qui ne l'est pas du tout, et que tu portes quand même ?",
      speakSeconds: 16,
      silenceSeconds: 54,
    },
    {
      text: "Pour finir : tu n'as pas besoin d'être certain que tout se passera bien. Tu as seulement besoin de savoir que tu pourras faire face à ce qui arrivera.",
      speakSeconds: 20,
      silenceSeconds: 55,
    },
  ],
};
