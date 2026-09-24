// Séances SOS : deux minutes, à déclencher au moment où ça ne va pas.
//
// Elles ne ressemblent pas aux autres, et c'est voulu. Une seule consigne à la fois, peu
// d'explications, les yeux ouverts, et une sortie concrète à la fin. On ne va pas explorer ce
// qu'on ressent : l'attention est tournée vers l'extérieur, parce que c'est ce qui aide sur le
// moment.
//
// Aucune ne demande de grande inspiration ni de rétention du souffle. Respirer fort quand on
// panique aggrave souvent les choses, et une consigne respiratoire ratée devient une preuve de
// plus qu'on n'y arrive pas.
//
// Elles sont gratuites, toutes les quatre, et le resteront : mettre du contenu de détresse
// derrière un abonnement ne se défend pas.

import type { ProgramContent } from '../../../src/features/wellbeing/types';

/** Crise d'angoisse — 2 minutes. L'attention va vers la pièce, pas vers le souffle. */
export const sosAngoisse: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Garde les yeux ouverts si tu peux. Regarde autour de toi et choisis un objet immobile. Remarque sa couleur, puis sa forme. Pour les prochaines secondes, tu n'as rien d'autre à faire que le regarder.",
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: "Remarque maintenant un contact : tes pieds sur le sol, ton dos contre le siège, ta main sur un tissu. Choisis celui qui te convient. Sens la surface, sans appuyer fort.",
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: "Laisse ta respiration se faire, sans chercher à prendre de grandes inspirations. Porte plutôt ton attention sur un son autour de toi. Puis sur un deuxième, s'il y en a un.",
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: "C'est bientôt fini. Si tu as besoin d'une présence, tu peux appeler quelqu'un et dire : « Je traverse un moment difficile, tu peux rester avec moi ? » Tu n'as pas à attendre que ce soit pire pour demander.",
      speakSeconds: 20,
      silenceSeconds: 10,
    },
  ],
};

/** Avant de prendre la parole — 2 minutes. On ne cherche pas le calme, on prépare un geste. */
export const sosPriseDeParole: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Sens tes pieds au sol, ou ton corps sur le siège. Pose ton regard sur un point stable devant toi. Tu as le droit de prendre cet instant avant de commencer.",
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: "Si tu peux, desserre un peu la mâchoire et les mains. Laisse passer une respiration à ton rythme. Tu n'as pas besoin de faire disparaître la nervosité — elle sert aussi à quelque chose.",
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: "Choisis seulement ta première phrase. Par exemple : « Je vais vous présenter le point principal. » Dis-la une fois dans ta tête, un peu plus lentement que d'habitude.",
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: "Au moment de commencer, retrouve tes appuis, dis ta première phrase, puis autorise-toi une pause. Tu peux parler avec une voix imparfaite et avancer une phrase après l'autre.",
      speakSeconds: 15,
      silenceSeconds: 15,
    },
  ],
};

/** Coup de stress au travail — 2 minutes. Discret, yeux ouverts, orienté vers une décision. */
export const sosStressTravail: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Si tu peux t'interrompre sans risque, pose les mains un instant et détourne le regard de l'écran. La prochaine réponse peut attendre quelques secondes.",
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: "Sens un contact avec le sol ou le siège. Laisse tes épaules prendre une position un peu plus confortable. Respire comme ça vient, sans chercher à réussir un exercice.",
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: "Demande-toi : quelle est la seule chose utile, maintenant ? Une petite action, une précision à demander, ou une pause. Tu n'as pas à traiter toute la liste.",
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: "Choisis la suite la plus réaliste. Si la demande dépasse ce que tu peux faire, tu peux dire : « J'ai besoin qu'on choisisse la priorité. » Puis avance à ton rythme.",
      speakSeconds: 15,
      silenceSeconds: 15,
    },
  ],
};

/**
 * Ruminations nocturnes — 2 minutes, fin silencieuse.
 * Aucune résolution de problème, aucune projection sur demain, aucune relance à la fin : tout
 * cela réveillerait précisément ce qu'on essaie de laisser retomber.
 */
export const sosRuminations: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: "Une pensée revient peut-être en boucle. Pour cet instant, tu n'as pas besoin de terminer le raisonnement. Tu peux simplement la reconnaître : voilà cette préoccupation.",
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: "Remarque un contact avec le lit : ta tête sur l'oreiller, une main posée, le poids d'une jambe. Choisis une sensation assez neutre, et laisse ton attention s'y poser.",
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: "Si la pensée revient, reprends les mêmes mots : voilà cette préoccupation. Puis retrouve le contact. Tu peux refaire ce mouvement autant de fois qu'il se présente, sans compter.",
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: "La voix va s'arrêter. Tu n'as rien à valider, rien à toucher. Pour le moment, aucune réponse n'est attendue de toi.",
      speakSeconds: 20,
      silenceSeconds: 10,
    },
  ],
};
