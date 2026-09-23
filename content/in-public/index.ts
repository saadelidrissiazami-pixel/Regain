// Séances « en public », narrées.
//
// Pensées pour être suivies les yeux ouverts et discrètement : transports, salle d'attente,
// file, open space. C'est le thème où le défilement automatique compte le plus — taper sur son
// écran toutes les vingt secondes dans un métro bondé est exactement ce qu'on cherche à éviter.
//
// Aucune ne demande de fermer les yeux, ni de respirer d'une façon particulière. L'attention va
// vers l'extérieur, jamais vers l'exploration de ce qu'on ressent.
//
// « Se détacher du regard des autres » garde son format interactif : elle mesure la gêne avant
// et après, et cette comparaison est tout son intérêt.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** Ancrage rapide — 1 minute, 60 s. */
export const ancrageRapide: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Sans rien changer à ta posture, sens le contact de tes pieds, ou de ton corps avec ce qui te porte.",
      speakSeconds: 12,
      silenceSeconds: 8,
    },
    {
      text: "Une seule respiration, normale. Ne la force pas.",
      speakSeconds: 10,
      silenceSeconds: 15,
    },
    {
      text: "C'est suffisant. Tu peux reprendre ce que tu faisais.",
      speakSeconds: 10,
      silenceSeconds: 5,
    },
  ],
};

/** Kit d'urgence — 2 minutes, 120 s. */
export const kitDurgence: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Deux minutes, où que tu sois. Pose tes pieds au sol et trouve trois objets autour de toi.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Trois respirations : inspire doucement, ajoute une toute petite inspiration par-dessus, puis expire longuement.",
      speakSeconds: 14,
      silenceSeconds: 16,
    },
    {
      text: "Dis-toi : je n'ai pas besoin de tout résoudre maintenant.",
      speakSeconds: 12,
      silenceSeconds: 18,
    },
    {
      text: "Quelle est ta prochaine petite action ? Fais uniquement celle-là.",
      speakSeconds: 14,
      silenceSeconds: 16,
    },
  ],
};

/** Sortie de trois minutes — 3 minutes, 180 s. */
export const sortieDeTroisMinutes: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Tu sens que tu satures. Ne pars pas tout de suite : arrête-toi quelques secondes et pose tes pieds au sol.",
      speakSeconds: 18,
      silenceSeconds: 12,
    },
    {
      text: "Trois respirations lentes.",
      speakSeconds: 10,
      silenceSeconds: 10,
    },
    {
      text: "Si tu peux, rejoins un endroit plus calme : un couloir, dehors, un banc, un coin moins fréquenté.",
      speakSeconds: 12,
      silenceSeconds: 13,
    },
    {
      text: "Maintenant, deux minutes sans téléphone. Trouve cinq choses que tu vois, quatre que tu entends, trois que tu sens dans ton corps.",
      speakSeconds: 14,
      silenceSeconds: 66,
    },
    {
      text: "Tu veux y retourner maintenant, ou prendre encore quelques minutes ? Décide calmement. Les deux sont acceptables.",
      speakSeconds: 15,
      silenceSeconds: 10,
    },
  ],
};

/** Mode observateur — 4 minutes, 240 s. */
export const modeObservateur: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Sans bouger d'où tu es : tu n'es pas obligé de participer à tout ce qui se passe ici. Tu peux redevenir un moment simple observateur.",
      speakSeconds: 20,
      silenceSeconds: 15,
    },
    {
      text: "Cherche trois couleurs autour de toi.",
      speakSeconds: 10,
      silenceSeconds: 30,
    },
    {
      text: "Trois formes.",
      speakSeconds: 8,
      silenceSeconds: 32,
    },
    {
      text: "Trois sons.",
      speakSeconds: 8,
      silenceSeconds: 32,
    },
    {
      text: "Et trois sensations : tes pieds au sol, ton dos contre le dossier, l'air sur ton visage.",
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: "Je n'ai pas besoin de contrôler la pièce. Je peux simplement être dedans.",
      speakSeconds: 15,
      silenceSeconds: 25,
    },
  ],
};

/** Le bouton pause — 4 minutes, 240 s. */
export const boutonPause: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Dis-toi mentalement : pause.",
      speakSeconds: 8,
      silenceSeconds: 12,
    },
    {
      text: "Pousse légèrement tes pieds contre le sol. Sens le contact.",
      speakSeconds: 12,
      silenceSeconds: 23,
    },
    {
      text: "Trois respirations : inspiration douce, expiration lente. Sans rien forcer.",
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: "Choisis une phrase courte, pour toi seul. « Je suis ici. » Ou : « Je n'ai rien à prouver. »",
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: "Ne réfléchis pas à toute la situation d'un coup. Demande-toi seulement : quelle est la prochaine petite chose que j'ai à faire ?",
      speakSeconds: 18,
      silenceSeconds: 32,
    },
    {
      text: "Fais uniquement celle-là. Puis la suivante, une à la fois.",
      speakSeconds: 15,
      silenceSeconds: 30,
    },
  ],
};

/** Respirer dans la foule — 4 minutes, 240 s. */
export const respirerDansLaFoule: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Ce trajet peut sembler long, entouré de monde. Tu n'as rien à performer ici.",
      speakSeconds: 16,
      silenceSeconds: 19,
    },
    {
      text: "Choisis un point fixe où poser ton regard. Pas pour l'examiner : juste pour le poser.",
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: "Compte quatre respirations. Ne change pas ta façon de respirer, compte seulement.",
      speakSeconds: 12,
      silenceSeconds: 33,
    },
    {
      text: "Remarque que personne ne te fixe. Chacun est pris dans son propre trajet, ses propres pensées.",
      speakSeconds: 16,
      silenceSeconds: 24,
    },
    {
      text: "Tes épaules peuvent descendre un peu. Ta mâchoire peut se desserrer.",
      speakSeconds: 12,
      silenceSeconds: 28,
    },
    {
      text: "Le trajet avance à son rythme, que tu sois tendu ou non. Autant l'être un peu moins.",
      speakSeconds: 15,
      silenceSeconds: 25,
    },
  ],
};

/**
 * Se détacher du regard des autres — format interactif conservé.
 * Elle mesure la gêne avant et après, et cette comparaison chiffrée est ce qu'elle apporte de
 * plus que les autres : la personne repart avec une preuve, pas une impression.
 */
export const detachementRegardAutres: ProgramContent = {
  type: 'grounding',
  steps: [
    { kind: 'text', text: "Vous êtes entouré de monde. Ce moment vous appartient autant qu'à n'importe qui d'autre ici." },
    {
      kind: 'scale',
      prompt: 'Là, maintenant : à quel point vous sentez-vous observé·e ou mal à l’aise ?',
      key: 'before',
    },
    {
      kind: 'text',
      text: "Sans fermer les yeux, posez votre regard sur quelque chose de neutre — une fenêtre, le sol, un point fixe.",
    },
    { kind: 'confirm', text: 'Prenez le temps de le trouver.', buttonLabel: "J'ai trouvé mon point" },
    {
      kind: 'text',
      text: "La plupart des gens autour de vous sont pris dans leurs propres pensées, pas dans les vôtres. On est rarement aussi observé qu'on le croit.",
    },
    {
      kind: 'breath-counter',
      text: 'Respirez normalement, sans rien forcer. Appuyez à chaque respiration.',
      count: 3,
    },
    { kind: 'text', text: "Sentez vos pieds au sol, ou votre corps posé sur le siège. Un point d'ancrage simple, toujours là." },
    { kind: 'text', text: "Vous n'avez rien à prouver ici. Juste à être là, jusqu'à la prochaine étape." },
    {
      kind: 'scale',
      prompt: 'Et maintenant : où en êtes-vous ?',
      key: 'after',
    },
  ],
};
