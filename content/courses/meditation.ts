// Parcours « Découvrir la méditation » — dix jours, de 2 à 6 minutes.
//
// La durée augmente doucement, mais ce n'est pas ce qui s'apprend ici. Ce qui s'apprend, c'est
// de remarquer que l'attention est partie et de revenir — le jour 3 le dit explicitement, et
// tous les jours suivants le répètent sous une autre forme.
//
// Chaque jour ajoute un seul outil et garde le précédent comme solution de repli : si compter
// gêne, on revient au souffle ; si le souffle gêne, on revient au contact. Personne ne se
// retrouve sans option.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** Jour 1 — Trouver un appui, 2 minutes. */
export const meditationJour1: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Premier jour. Installe-toi comme tu peux. Tu peux fermer les yeux, ou garder le regard posé devant toi.",
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: "On cherche un appui : le contact de tes pieds sur le sol, ou de tes mains posées. Choisis celui que tu sens le plus facilement.",
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: "Reste avec cette sensation. C'est tout ce qu'on fait aujourd'hui : poser son attention quelque part.",
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: "Tu viens de faire deux minutes. C'était le seul objectif.",
      speakSeconds: 15,
      silenceSeconds: 15,
    },
  ],
};

/** Jour 2 — Suivre un mouvement, 3 minutes. */
export const meditationJour2: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Hier, un appui. Aujourd'hui, quelque chose qui bouge : ta respiration.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Ne la change pas. Remarque seulement l'air qui entre, l'air qui sort, ou le ventre qui se soulève.",
      speakSeconds: 16,
      silenceSeconds: 19,
    },
    {
      text: "Si observer ton souffle te met mal à l'aise, c'est fréquent : reviens à l'appui d'hier, tes pieds ou tes mains. Ce n'est pas un repli, c'est une autre porte.",
      speakSeconds: 18,
      silenceSeconds: 22,
    },
    {
      text: "Continue à suivre le mouvement, sans le corriger.",
      speakSeconds: 12,
      silenceSeconds: 28,
    },
    {
      text: "C'est fini pour aujourd'hui.",
      speakSeconds: 10,
      silenceSeconds: 25,
    },
  ],
};

/** Jour 3 — Revenir, tout simplement, 3 minutes. Le cœur du parcours. */
export const meditationJour3: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Aujourd'hui, le jour le plus important du parcours. On va apprendre à revenir.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Pose ton attention sur ton souffle, ou sur ton appui. À un moment, ton esprit partira ailleurs. C'est certain, et ce n'est pas un problème.",
      speakSeconds: 18,
      silenceSeconds: 17,
    },
    {
      text: "Tu viens peut-être de remarquer que ton attention était ailleurs. Tu peux maintenant retrouver ton appui. Ce moment-là, cette bascule, c'est tout l'exercice.",
      speakSeconds: 20,
      silenceSeconds: 20,
    },
    {
      text: "Recommence autant de fois qu'il le faut. Dix fois en trois minutes est un très bon score.",
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: "Partir et revenir, ce n'est pas rater la méditation. C'est la faire.",
      speakSeconds: 13,
      silenceSeconds: 22,
    },
  ],
};

/** Jour 4 — Un petit compte, 4 minutes. */
export const meditationJour4: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Un outil de plus aujourd'hui : compter. Ça donne à l'esprit quelque chose à tenir.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "À chaque expiration, compte : un, deux, trois, quatre, cinq. Puis recommence à un.",
      speakSeconds: 16,
      silenceSeconds: 24,
    },
    {
      text: "Si tu perds le compte, reprends à un. Ce n'est pas une punition — c'est exactement le retour d'hier, avec des chiffres.",
      speakSeconds: 17,
      silenceSeconds: 28,
    },
    {
      text: "Continue à ton rythme.",
      speakSeconds: 10,
      silenceSeconds: 35,
    },
    {
      text: "Si tu te surprends à compter vite pour bien faire, ralentis. Le compte suit le souffle, pas l'inverse.",
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: "C'est terminé pour aujourd'hui.",
      speakSeconds: 10,
      silenceSeconds: 25,
    },
  ],
};

/** Jour 5 — Retirer le compte, 4 minutes. */
export const meditationJour5: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Aujourd'hui on enlève une aide. Commence comme hier : compte cinq expirations.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Encore quelques cycles comptés, tranquillement.",
      speakSeconds: 12,
      silenceSeconds: 28,
    },
    {
      text: "Maintenant, arrête de compter. Reste avec le souffle, sans chiffres. Tu remarqueras peut-être que c'est plus difficile : c'est normal, tu viens de retirer un garde-fou.",
      speakSeconds: 20,
      silenceSeconds: 25,
    },
    {
      text: "Continue sans compter.",
      speakSeconds: 10,
      silenceSeconds: 35,
    },
    {
      text: "Si tu te perds trop, tu as le droit de reprendre le compte. Une aide qu'on reprend n'est pas un échec.",
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: "C'est fini.",
      speakSeconds: 10,
      silenceSeconds: 25,
    },
  ],
};

/** Jour 6 — Reconnaître une pensée, 5 minutes. */
export const meditationJour6: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Jusqu'ici, on revenait dès qu'on partait. Aujourd'hui, on nomme d'abord.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Quand tu remarques que tu suis une pensée, dis-toi simplement : une pensée. Sans chercher de quoi elle parle.",
      speakSeconds: 18,
      silenceSeconds: 22,
    },
    {
      text: "Puis reviens à ton souffle. Nommer, revenir. C'est tout.",
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: "Essaie maintenant, sans que je parle.",
      speakSeconds: 10,
      silenceSeconds: 40,
    },
    {
      text: "Tu remarqueras que certaines pensées reviennent. Les nommer ne les fait pas disparaître, et ce n'est pas le but.",
      speakSeconds: 16,
      silenceSeconds: 34,
    },
    {
      text: "Encore un moment.",
      speakSeconds: 10,
      silenceSeconds: 35,
    },
    {
      text: "Nommer crée un petit écart entre toi et ce que tu penses. Cet écart est tout ce qu'on cherche.",
      speakSeconds: 15,
      silenceSeconds: 25,
    },
  ],
};

/** Jour 7 — Faire une place à ce qui est là, 5 minutes. */
export const meditationJour7: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Aujourd'hui, on regarde ce qui est là. Si c'est trop, tu peux revenir au souffle à tout moment : c'est une option, pas un abandon.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Y a-t-il une émotion présente en ce moment ? De l'agacement, de la fatigue, de l'inquiétude, ou rien de particulier.",
      speakSeconds: 18,
      silenceSeconds: 22,
    },
    {
      text: "Si tu en trouves une, vois si elle se sent quelque part dans le corps. La gorge, la poitrine, le ventre.",
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: "Tu n'as pas à la changer. Juste à lui laisser la place qu'elle prend déjà.",
      speakSeconds: 12,
      silenceSeconds: 38,
    },
    {
      text: "Maintenant, retrouve un contact concret : tes mains, tes pieds, ton souffle.",
      speakSeconds: 14,
      silenceSeconds: 36,
    },
    {
      text: "Reste là quelques instants.",
      speakSeconds: 10,
      silenceSeconds: 35,
    },
    {
      text: "Accueillir n'est pas aimer. C'est arrêter de lutter contre ce qui est déjà arrivé.",
      speakSeconds: 15,
      silenceSeconds: 25,
    },
  ],
};

/** Jour 8 — Revenir grâce aux sons, 5 minutes. */
export const meditationJour8: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Une troisième porte aujourd'hui, après le corps et le souffle : les sons.",
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: "Écoute ce qu'il y a autour de toi. Ne cherche pas à identifier : laisse les sons arriver et repartir.",
      speakSeconds: 18,
      silenceSeconds: 22,
    },
    {
      text: "Les sons ont un avantage : ils se renouvellent tout seuls. Il y a toujours quelque chose à écouter, même le silence d'une pièce.",
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: "Continue à écouter.",
      speakSeconds: 10,
      silenceSeconds: 40,
    },
    {
      text: "Quand tu pars, reviens au son le plus proche.",
      speakSeconds: 12,
      silenceSeconds: 38,
    },
    {
      text: "Encore un moment.",
      speakSeconds: 10,
      silenceSeconds: 35,
    },
    {
      text: "Tu as maintenant trois appuis possibles. C'est utile : selon les jours, l'un marche mieux que les autres.",
      speakSeconds: 15,
      silenceSeconds: 25,
    },
  ],
};

/** Jour 9 — Choisir son repère, 6 minutes. */
export const meditationJour9: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Aujourd'hui, c'est toi qui choisis. Souffle, contact du corps, ou sons.",
      speakSeconds: 18,
      silenceSeconds: 17,
    },
    {
      text: "Choisis maintenant, et garde ce choix jusqu'au bout de la séance, même s'il ne semble pas être le bon.",
      speakSeconds: 16,
      silenceSeconds: 34,
    },
    {
      text: "Installe-toi avec ton repère. Je vais parler beaucoup moins aujourd'hui.",
      speakSeconds: 13,
      silenceSeconds: 42,
    },
    {
      text: "Reviens quand tu pars.",
      speakSeconds: 8,
      silenceSeconds: 52,
    },
    {
      text: "Continue.",
      speakSeconds: 6,
      silenceSeconds: 54,
    },
    {
      text: "Tenir un choix imparfait vaut mieux que changer de repère dès que c'est inconfortable. C'est vrai ici, et pas seulement ici.",
      speakSeconds: 16,
      silenceSeconds: 39,
    },
    {
      text: "Encore quelques instants.",
      speakSeconds: 10,
      silenceSeconds: 35,
    },
  ],
};

/** Jour 10 — Une pause à ta mesure, 6 minutes. */
export const meditationJour10: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: "Dernier jour. On reprend la séquence complète : s'installer, choisir, partir, revenir.",
      speakSeconds: 18,
      silenceSeconds: 17,
    },
    {
      text: "Installe-toi, et choisis ton repère.",
      speakSeconds: 12,
      silenceSeconds: 38,
    },
    {
      text: "Reste avec lui. Quand tu pars, reviens, sans commentaire.",
      speakSeconds: 13,
      silenceSeconds: 42,
    },
    {
      text: "Continue seul.",
      speakSeconds: 8,
      silenceSeconds: 52,
    },
    {
      text: "Encore un moment.",
      speakSeconds: 8,
      silenceSeconds: 52,
    },
    {
      text: "Pour la suite, choisis un moment qui existe déjà dans ta journée : le café du matin, le trajet, le moment avant de dormir. Une minute suffit à reprendre ce geste.",
      speakSeconds: 20,
      silenceSeconds: 35,
    },
    {
      text: "Tu as fait dix jours. Tu sais maintenant à quoi ça ressemble, et c'est quelque chose qu'on ne peut pas lire — seulement pratiquer.",
      speakSeconds: 15,
      silenceSeconds: 30,
    },
  ],
};
