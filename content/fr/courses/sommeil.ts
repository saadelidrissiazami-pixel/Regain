// Parcours « Mieux dormir » — dix jours, de 3 à 7 minutes.
//
// Le fil du parcours est de réduire l'effort, pas d'en ajouter. Aucun jour ne promet
// l'endormissement : vérifier si le sommeil arrive est exactement ce qui le repousse, et une
// promesse crée cette vérification.
//
// Les jours 1 et 6 se font debout, avant de se coucher — ils gardent donc le bilan de fin. Tous
// les autres s'écoutent au lit et se terminent en silence, sans rien demander.

import type { ProgramContent } from '../../../src/features/wellbeing/types';

/** Jour 1 — Terminer la journée, 3 minutes. Avant le lit. */
export const sommeilJour1: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Premier jour, et il se fait debout. On va marquer la fin de la journée, avant même de penser à dormir.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Regarde ce qui reste en cours autour de toi. Choisis une seule chose à suspendre pour ce soir, et laisse-la où elle est.",
      speakSeconds: 16,
      silenceSeconds: 19,
    },
    {
      text: "Maintenant, choisis ce que tu vas faire jusqu'au coucher : quelque chose de calme, et que tu aimes. Lire, écouter, ranger doucement.",
      speakSeconds: 18,
      silenceSeconds: 22,
    },
    {
      text: "Cette bascule compte plus qu'on ne croit. Le corps a besoin d'une frontière entre la journée et la nuit, et rien ne la pose à ta place.",
      speakSeconds: 16,
      silenceSeconds: 24,
    },
    {
      text: "C'est tout pour aujourd'hui. Demain, on sera déjà au lit.",
      speakSeconds: 13,
      silenceSeconds: 22,
    },
  ],
};

/** Jour 2 — Sentir le soutien du lit, 3 minutes. */
export const sommeilJour2: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "Tu es au lit. On ne va rien faire d'autre que remarquer où ton corps est porté.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Trouve un premier contact avec le matelas ou l'oreiller. La tête, une épaule, le bas du dos.",
      speakSeconds: 16,
      silenceSeconds: 19,
    },
    {
      text: "Un deuxième, ailleurs.",
      speakSeconds: 10,
      silenceSeconds: 30,
    },
    {
      text: "Et un troisième, si tu en trouves un.",
      speakSeconds: 10,
      silenceSeconds: 30,
    },
    {
      text: "Le lit te porte entièrement. Tu n'as rien à tenir.",
      speakSeconds: 13,
      silenceSeconds: 22,
    },
  ],
};

/** Jour 3 — Laisser respirer, 4 minutes. */
export const sommeilJour3: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "Aujourd'hui, la respiration — mais sans rythme à suivre. On observe seulement.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Remarque quelques respirations telles qu'elles viennent. Ne les allonge pas, ne les ralentis pas.",
      speakSeconds: 16,
      silenceSeconds: 24,
    },
    {
      text: "Si tu te surprends à vouloir bien respirer, laisse tomber : c'est encore un effort, et on en enlève, on n'en ajoute pas.",
      speakSeconds: 17,
      silenceSeconds: 28,
    },
    {
      text: "Reviens maintenant aux contacts d'hier, le lit sous toi.",
      speakSeconds: 12,
      silenceSeconds: 33,
    },
    {
      text: "Souffle, ou contacts. Les deux sont là si tu en as besoin.",
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: "C'est fini.",
      speakSeconds: 10,
      silenceSeconds: 25,
    },
  ],
};

/** Jour 4 — Desserrer doucement, 4 minutes. */
export const sommeilJour4: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "On va relâcher trois endroits, sans les contracter d'abord. Contracter pour mieux relâcher réveille plus qu'autre chose.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Les mains. Laisse les doigts s'ouvrir un peu, d'eux-mêmes.",
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: "La mâchoire. Les dents n'ont pas besoin de se toucher.",
      speakSeconds: 13,
      silenceSeconds: 32,
    },
    {
      text: "Les épaules. Elles peuvent descendre d'un centimètre, pas plus.",
      speakSeconds: 13,
      silenceSeconds: 32,
    },
    {
      text: "Si rien ne se détend, ce n'est pas grave. Tu as quand même arrêté de serrer pendant une minute.",
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: "C'est terminé.",
      speakSeconds: 10,
      silenceSeconds: 25,
    },
  ],
};

/** Jour 5 — Parcourir le corps, 5 minutes. */
export const sommeilJour5: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "On reprend les zones d'hier, et on parcourt tout le corps, des pieds à la tête.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Les pieds. Sans les bouger, juste en y posant l'attention.",
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: "Les jambes, puis les hanches.",
      speakSeconds: 12,
      silenceSeconds: 33,
    },
    {
      text: "Le ventre, le dos, la poitrine.",
      speakSeconds: 12,
      silenceSeconds: 38,
    },
    {
      text: "Les mains, les bras, les épaules.",
      speakSeconds: 12,
      silenceSeconds: 38,
    },
    {
      text: "La mâchoire, le visage, le front.",
      speakSeconds: 12,
      silenceSeconds: 33,
    },
    {
      text: "Le corps entier, d'un seul tenant.",
      speakSeconds: 12,
      silenceSeconds: 28,
    },
  ],
};

/** Jour 6 — Déposer ce qui reste, 5 minutes. Avant le lit, avec un papier. */
export const sommeilJour6: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Celle-ci se fait avant de te coucher, avec un papier et un crayon. Prends-les maintenant.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Écris une préoccupation. Une seule, celle qui revient le plus. Prends le temps de la formuler en entier.",
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: "Relis-la. Est-ce qu'elle dit vraiment ce qui t'inquiète, ou seulement ce qui se voit ?",
      speakSeconds: 15,
      silenceSeconds: 30,
    },
    {
      text: "En dessous, écris une toute petite action possible demain. Pas la solution : la première étape.",
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: "Ferme le carnet, ou retourne la feuille. Ce geste compte : ton cerveau arrête de répéter ce qu'il sait consigné ailleurs.",
      speakSeconds: 18,
      silenceSeconds: 32,
    },
    {
      text: "S'il reste d'autres préoccupations, elles attendront le carnet de demain.",
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: "Tu peux aller te coucher.",
      speakSeconds: 12,
      silenceSeconds: 23,
    },
  ],
};

/** Jour 7 — Reconnaître le scénario, 5 minutes. */
export const sommeilJour7: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "Ce soir, on s'occupe des pensées qui tournent. On ne va pas les résoudre.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Quand une préoccupation revient, nomme-la : voilà cette préoccupation. Puis retrouve un contact avec le lit.",
      speakSeconds: 18,
      silenceSeconds: 22,
    },
    {
      text: "Cette préoccupation revient. Tu peux la reconnaître sans poursuivre la discussion maintenant.",
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: "Essaie, sans que je parle.",
      speakSeconds: 10,
      silenceSeconds: 40,
    },
    {
      text: "Si la même revient dix fois, nomme-la dix fois. Ce n'est pas un échec, c'est un entraînement.",
      speakSeconds: 14,
      silenceSeconds: 36,
    },
    {
      text: "Encore un moment.",
      speakSeconds: 10,
      silenceSeconds: 35,
    },
    {
      text: "La nuit n'est pas le bon moment pour décider. Rien de ce que tu trancherais maintenant ne tiendrait demain.",
      speakSeconds: 15,
      silenceSeconds: 25,
    },
  ],
};

/** Jour 8 — Retrouver un lieu familier, 6 minutes. */
export const sommeilJour8: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "Ce soir, un lieu. Pas un lieu de rêve : un endroit réel que tu connais, calme ou simplement neutre.",
      speakSeconds: 18,
      silenceSeconds: 17,
    },
    {
      text: "Choisis-le. Une pièce, un chemin, une plage vue une fois.",
      speakSeconds: 14,
      silenceSeconds: 36,
    },
    {
      text: "Qu'est-ce que tu vois d'abord ? Reste sur un détail, pas sur l'ensemble.",
      speakSeconds: 15,
      silenceSeconds: 40,
    },
    {
      text: "Qu'est-ce que tu entends là-bas ?",
      speakSeconds: 10,
      silenceSeconds: 50,
    },
    {
      text: "Et qu'est-ce que tu sens sous tes pieds, ou sur ta peau ?",
      speakSeconds: 12,
      silenceSeconds: 48,
    },
    {
      text: "Si le lieu se brouille ou disparaît, laisse-le partir. Reviens aux contacts du lit : ils sont toujours là.",
      speakSeconds: 15,
      silenceSeconds: 40,
    },
    {
      text: "Reste où tu veux, là-bas ou ici.",
      speakSeconds: 10,
      silenceSeconds: 35,
    },
  ],
};

/** Jour 9 — Laisser le sommeil venir, 6 minutes. */
export const sommeilJour9: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "Ce soir, on s'occupe de l'effort lui-même. Celui qu'on fait pour s'endormir.",
      speakSeconds: 18,
      silenceSeconds: 17,
    },
    {
      text: "Remarque si une partie de toi surveille : est-ce que ça vient ? est-ce que ça marche ? C'est cette surveillance qui tient éveillé, pas le bruit ni les pensées.",
      speakSeconds: 20,
      silenceSeconds: 30,
    },
    {
      text: "Tu n'as pas à vérifier si le sommeil arrive. Pour l'instant, laisse simplement ton corps trouver une position confortable.",
      speakSeconds: 15,
      silenceSeconds: 40,
    },
    {
      text: "Choisis une technique que tu connais déjà : les contacts, le souffle, le lieu d'hier. Celle qui te convient ce soir.",
      speakSeconds: 15,
      silenceSeconds: 45,
    },
    {
      text: "Reste avec elle, sans attendre de résultat.",
      speakSeconds: 10,
      silenceSeconds: 50,
    },
    {
      text: "Se reposer les yeux fermés a déjà de la valeur, même sans dormir. Ça enlève l'enjeu, et l'enjeu est le problème.",
      speakSeconds: 15,
      silenceSeconds: 40,
    },
    {
      text: "Plus rien à faire.",
      speakSeconds: 10,
      silenceSeconds: 35,
    },
  ],
};

/** Jour 10 — Composer son rituel, 7 minutes. */
export const sommeilJour10: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "Dernier soir. On assemble : une transition avant le lit, et un seul exercice une fois couché.",
      speakSeconds: 18,
      silenceSeconds: 17,
    },
    {
      text: "D'abord la transition. Qu'est-ce qui marquera la fin de ta journée, demain soir ? Une chose simple, que tu feras vraiment.",
      speakSeconds: 18,
      silenceSeconds: 32,
    },
    {
      text: "Ensuite, un seul exercice pour le lit. Les contacts, le relâchement, le parcours du corps, le lieu familier. Celui que tu as préféré.",
      speakSeconds: 18,
      silenceSeconds: 37,
    },
    {
      text: "Fais-le maintenant, celui que tu viens de choisir. Je te laisse.",
      speakSeconds: 12,
      silenceSeconds: 48,
    },
    {
      text: "Continue.",
      speakSeconds: 8,
      silenceSeconds: 52,
    },
    {
      text: "Deux choses, c'est un rituel suffisant. Trois, on ne le tient pas.",
      speakSeconds: 14,
      silenceSeconds: 46,
    },
    {
      text: "Si les nuits restent difficiles plusieurs semaines, en parler à un médecin apporte plus que n'importe quel exercice : il existe des prises en charge qui marchent vraiment.",
      speakSeconds: 20,
      silenceSeconds: 35,
    },
    {
      text: "Bonne nuit.",
      speakSeconds: 10,
      silenceSeconds: 35,
    },
  ],
};
