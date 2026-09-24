// Méditations narrées.
//
// Chaque séance se déroule seule : un bloc de texte, puis un silence pour le vivre. Les durées
// sont écrites à la main plutôt qu'estimées, et leur somme est la durée réelle de la séance —
// tests/narration.test.ts et tests/catalogue.test.ts veillent à ce qu'elle corresponde à ce que
// le catalogue annonce.
//
// Toutes suivent le même arc : on s'installe, on trouve un appui concret, on choisit un point
// d'attention, on apprend quoi faire quand une pensée arrive, on pratique avec moins de guidage,
// on accueille l'état du moment, on revient. Le silence s'allonge après l'enseignement du geste,
// puis se resserre à la sortie. Rien ne demande d'aller mieux.

import type { ProgramContent } from '../../../src/features/wellbeing/types';

/** 1 minute — 60 s. */
export const pauseUneMinute: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Une minute, là où tu es. Tu peux fermer les yeux, ou juste baisser le regard.",
      speakSeconds: 12,
      silenceSeconds: 8,
    },
    {
      text: "Laisse passer trois respirations sans rien y changer. Tu observes, tu ne corriges pas.",
      speakSeconds: 10,
      silenceSeconds: 18,
    },
    {
      text: "C'est déjà fini. Reprends quand tu veux.",
      speakSeconds: 8,
      silenceSeconds: 4,
    },
  ],
};

/** Ancrage du matin — 3 minutes, 180 s. */
export const ancrageMatin: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Installe-toi comme tu peux, assis ou allongé. Tu peux fermer les yeux ou garder le regard posé devant toi. Tu peux aussi bouger, ou arrêter, à tout moment.",
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: "Remarque le contact entre ton corps et ce qui te soutient : la chaise, le lit, le sol. Choisis un endroit où le contact est facile à sentir.",
      speakSeconds: 18,
      silenceSeconds: 12,
    },
    {
      text: "Si c'est confortable, remarque maintenant le mouvement de ta respiration. Laisse-la suivre son rythme, sans l'allonger.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Des pensées vont arriver, c'est normal. Quand tu remarques que tu les suis, reviens simplement à ton appui. Ce retour, c'est tout l'exercice.",
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: "Je te laisse un peu de silence. Reviens à ton appui quand tu y penses.",
      speakSeconds: 10,
      silenceSeconds: 15,
    },
    {
      text: "Pose-toi cette question, sans y répondre tout de suite : de quoi est-ce que j'ai besoin aujourd'hui ?",
      speakSeconds: 14,
      silenceSeconds: 6,
    },
    {
      text: "Remarque les sons autour de toi. Ouvre les yeux à ton rythme.",
      speakSeconds: 10,
      silenceSeconds: 5,
    },
  ],
};

/** Méditation du soir — 5 minutes, 300 s. Se termine sans rien demander. */
export const meditationSoir: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "Installe-toi là où tu es, sans chercher à être ailleurs. La journée est derrière toi, même si elle s'est mal passée.",
      speakSeconds: 22,
      silenceSeconds: 13,
    },
    {
      text: "Repasse la journée sans la juger, comme un paysage qui défile par une fenêtre. Tu n'as pas à en faire le bilan.",
      speakSeconds: 20,
      silenceSeconds: 30,
    },
    {
      text: "Est-ce qu'il reste quelque chose que tu portes encore ? Une tension, une phrase, une pensée qui revient.",
      speakSeconds: 20,
      silenceSeconds: 30,
    },
    {
      text: "Tu n'as pas à la résoudre maintenant. Tu peux simplement la reconnaître, et la poser à côté de toi pour ce soir. Elle sera encore là demain si elle compte.",
      speakSeconds: 22,
      silenceSeconds: 28,
    },
    {
      text: "Sens le poids de ton corps, un peu plus posé à chaque expiration.",
      speakSeconds: 16,
      silenceSeconds: 34,
    },
    {
      text: "Tu n'as plus rien à accomplir aujourd'hui. Même si la liste n'est pas finie, elle peut attendre la lumière du jour.",
      speakSeconds: 18,
      silenceSeconds: 22,
    },
    {
      text: "La voix va s'arrêter maintenant. Tu n'as rien à valider, rien à toucher.",
      speakSeconds: 15,
      silenceSeconds: 10,
    },
  ],
};

/** Méditation des 5 sens — 5 minutes, 300 s. */
export const meditationCinqSens: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Garde les yeux ouverts pour celle-ci. On va traverser les cinq sens, un par un, sans se presser. Rien à réussir.",
      speakSeconds: 22,
      silenceSeconds: 8,
    },
    {
      text: "La vue. Trouve cinq choses que tu vois autour de toi. Nomme-les dans ta tête, sans les juger. Prends ton temps pour les cinq.",
      speakSeconds: 20,
      silenceSeconds: 40,
    },
    {
      text: "L'ouïe. Maintenant quatre sons, même discrets : une voix au loin, une ventilation, ta propre respiration.",
      speakSeconds: 18,
      silenceSeconds: 37,
    },
    {
      text: "Le toucher. Trois sensations physiques : tes pieds sur le sol, un tissu contre ta peau, le dossier contre ton dos.",
      speakSeconds: 18,
      silenceSeconds: 32,
    },
    {
      text: "L'odorat. Deux odeurs, même très légères. Si tu n'en trouves pas, reste simplement attentif quelques instants.",
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: "Le goût. Une seule sensation dans ta bouche, telle qu'elle est.",
      speakSeconds: 15,
      silenceSeconds: 20,
    },
    {
      text: "Tu viens de faire le tour. Tu es ici, maintenant, et tu n'as rien à résoudre pendant ces quelques minutes.",
      speakSeconds: 20,
      silenceSeconds: 5,
    },
  ],
};

/** Observer ses pensées — 8 minutes, 480 s. */
export const meditationObserverPensees: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Installe-toi et respire normalement. Ferme les yeux si tu es à l'aise, sinon pose le regard devant toi.",
      speakSeconds: 22,
      silenceSeconds: 13,
    },
    {
      text: "Pendant ces huit minutes, tu ne vas pas chercher à arrêter tes pensées. Personne n'y arrive, et ce n'est pas le but.",
      speakSeconds: 22,
      silenceSeconds: 23,
    },
    {
      text: "Voilà le geste : quand une pensée arrive et que tu remarques que tu la suis, dis-toi doucement « une pensée ». Puis reviens à ta respiration. Sans te presser.",
      speakSeconds: 25,
      silenceSeconds: 35,
    },
    {
      text: "Si tu penses « je n'y arrive pas » : une pensée. Retour au souffle. Si tu penses « je devrais faire autre chose » : une pensée. Retour au souffle.",
      speakSeconds: 22,
      silenceSeconds: 38,
    },
    {
      text: "Essaie maintenant par toi-même. Je te laisse du silence.",
      speakSeconds: 12,
      silenceSeconds: 63,
    },
    {
      text: "Continue. Il n'y a pas de bon score, et remarquer que tu étais parti loin, c'est déjà réussir.",
      speakSeconds: 10,
      silenceSeconds: 70,
    },
    {
      text: "Tu n'essaies pas de supprimer tes pensées. Tu apprends la différence entre avoir une pensée et devoir la croire, ou agir selon elle.",
      speakSeconds: 25,
      silenceSeconds: 35,
    },
    {
      text: "Encore quelques instants, puis nous nous arrêterons. Une pensée n'est pas forcément un fait.",
      speakSeconds: 20,
      silenceSeconds: 45,
    },
  ],
};

/** Scanner corporel — 9 minutes, 540 s. */
export const meditationScanCorporel: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Assieds-toi ou allonge-toi. On va parcourir le corps lentement, de bas en haut. Tu observes, tu ne corriges rien.",
      speakSeconds: 22,
      silenceSeconds: 13,
    },
    {
      text: "Commence par tes pieds. Chaleur, fraîcheur, appui, tension. Ce que tu trouves, et aussi l'absence de sensation.",
      speakSeconds: 20,
      silenceSeconds: 40,
    },
    {
      text: "Remonte vers les mollets, puis les cuisses. Observe simplement, sans chercher à détendre quoi que ce soit.",
      speakSeconds: 18,
      silenceSeconds: 42,
    },
    {
      text: "Ton ventre. Remarque le mouvement de la respiration à cet endroit précis.",
      speakSeconds: 18,
      silenceSeconds: 42,
    },
    {
      text: "Ta poitrine. La respiration continue toute seule, sans que tu aies à t'en occuper.",
      speakSeconds: 16,
      silenceSeconds: 44,
    },
    {
      text: "Tes épaules. Sont-elles remontées ? Si oui, laisse-les descendre d'un centimètre. Pas plus.",
      speakSeconds: 20,
      silenceSeconds: 45,
    },
    {
      text: "Ta mâchoire. Desserre les dents, laisse la langue se poser. C'est souvent là que la journée s'accroche.",
      speakSeconds: 18,
      silenceSeconds: 42,
    },
    {
      text: "Ton visage. Le front, le contour des yeux, les joues, la bouche.",
      speakSeconds: 20,
      silenceSeconds: 45,
    },
    {
      text: "Pour finir, observe ton corps comme un ensemble. Tu n'as pas à faire disparaître les sensations qui restent — tu peux simplement les laisser être là.",
      speakSeconds: 25,
      silenceSeconds: 50,
    },
  ],
};
