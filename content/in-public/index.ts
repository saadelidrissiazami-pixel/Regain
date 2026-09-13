import type { ProgramContent } from '../../src/features/wellbeing/types';

// Pensés pour être suivis les yeux ouverts, discrètement : transports, salle d'attente,
// file d'attente... n'importe où on se sent entouré et observé.

export const ancrageRapide: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Sans rien changer à votre posture, sentez le contact de vos pieds ou de votre corps avec ce qui vous porte.",
    "Une seule respiration, normale, sans la forcer.",
    "C'est suffisant. Vous pouvez continuer ce que vous étiez en train de faire.",
  ],
};

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

export const respirerDansLaFoule: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Ce trajet peut sembler long, entouré de monde. Vous n'avez rien à performer ici.",
    "Choisissez un point fixe à regarder — pas pour l'examiner, juste pour poser votre regard.",
    "Comptez quatre respirations, sans changer votre façon de respirer, juste en comptant.",
    "Remarquez que personne ne vous fixe. Chacun est absorbé par son propre trajet, ses propres pensées.",
    "Vos épaules peuvent descendre un peu. Votre mâchoire peut se desserrer.",
    "Le trajet avance à son rythme, que vous soyez tendu ou détendu. Autant l'être un peu moins.",
    "Vous arriverez bientôt. Jusque-là, ce moment ne demande rien de plus que d'être traversé.",
  ],
};

export const sortieDeTroisMinutes: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Quand tu sens que tu commences à être saturé·e, ne pars pas immédiatement. Arrête-toi quelques secondes, pose tes pieds au sol.",
    "Fais trois respirations lentes.",
    "Cherche une zone plus calme si possible : couloir, extérieur, banc, coin moins fréquenté.",
    "Pendant deux minutes, sans regarder ton téléphone : trouve cinq choses que tu vois, quatre que tu entends, trois sensations physiques.",
    "Puis demande-toi : est-ce que je veux retourner maintenant, ou prendre encore quelques minutes ? Décide calmement.",
  ],
};

export const modeObservateur: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Sans quitter l'endroit où tu es, imagine que tu n'es pas obligé·e de participer à tout ce qui s'y passe. Deviens un instant simple observateur·rice.",
    "Cherche trois couleurs autour de toi.",
    "Cherche trois formes.",
    "Cherche trois sons.",
    "Cherche trois sensations physiques — tes pieds au sol, ton dos contre la chaise, l'air sur ton visage.",
    "Termine par : je n'ai pas besoin de contrôler la pièce. Je peux simplement être présent·e dedans.",
  ],
};

export const boutonPause: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Dis-toi mentalement : pause.",
    "Pousse légèrement tes pieds contre le sol. Sens leur contact.",
    "Fais trois respirations : inspiration douce, expiration lente.",
    "Choisis une phrase courte de sécurité : « je suis ici », ou « je n'ai rien à prouver ».",
    "Ne réfléchis pas à toute la situation d'un coup. Demande-toi simplement : quelle est la prochaine petite chose que j'ai à faire ?",
    "Fais uniquement cette action. Puis la suivante, une à la fois.",
  ],
};

export const kitDurgence: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Ce kit se fait en deux minutes, où que tu sois. Pose tes pieds au sol, regarde autour de toi et trouve trois objets.",
    "Fais trois respirations : inspire doucement, ajoute une toute petite inspiration supplémentaire, puis expire longuement.",
    "Dis-toi mentalement : je n'ai pas besoin de résoudre tout maintenant.",
    "Demande-toi : quelle est ma prochaine petite action ? Puis fais uniquement celle-là.",
  ],
};
