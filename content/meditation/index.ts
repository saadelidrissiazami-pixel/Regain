import type { ProgramContent } from '../../src/features/wellbeing/types';

export const pauseUneMinute: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Fermez les yeux un instant, où que vous soyez.",
    "Portez attention à trois respirations, sans chercher à les changer.",
    "Rouvrez les yeux quand vous êtes prêt·e à reprendre.",
  ],
};

export const ancrageMatin: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Installez-vous confortablement, assis ou allongé. Si vous le souhaitez, fermez les yeux.",
    "Prenez conscience du contact entre votre corps et ce qui vous soutient — la chaise, le lit, le sol.",
    "Inspirez doucement par le nez, et laissez l'air ressortir sans le forcer.",
    "Remarquez les sons autour de vous, sans chercher à les identifier. Laissez-les simplement être là.",
    "Posez-vous cette question, sans y répondre tout de suite : de quoi ai-je besoin aujourd'hui ?",
    "Prenez encore trois respirations, à votre rythme.",
    "Quand vous êtes prêt, ouvrez doucement les yeux et emportez ce moment avec vous.",
  ],
};

export const meditationSoir: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Installez-vous là où vous êtes, sans chercher à être ailleurs.",
    "Repassez la journée sans la juger, comme si vous regardiez un paysage défiler.",
    "Y a-t-il quelque chose que vous portez encore, une tension, une pensée qui revient ?",
    "Vous n'avez pas à la résoudre maintenant. Vous pouvez simplement la reconnaître.",
    "Inspirez, et imaginez que vous posez cette pensée à côté de vous, pour ce soir.",
    "Sentez le poids de votre corps se relâcher, un peu plus à chaque expiration.",
    "La journée est en train de se terminer. Vous n'avez plus rien à accomplir aujourd'hui.",
    "Quand vous êtes prêt·e, laissez ce moment vous accompagner vers le repos.",
  ],
};

export const meditationCinqSens: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Installe-toi confortablement. Tu peux garder les yeux ouverts.",
    "La vue : trouve cinq choses que tu vois autour de toi, sans les juger, juste les nommer.",
    "L'ouïe : trouve quatre sons différents, même discrets — une voix, une ventilation, ta propre respiration.",
    "Le toucher : trouve trois sensations physiques — tes pieds sur le sol, un tissu, un dossier contre ton dos.",
    "L'odorat : trouve deux odeurs, même très légères.",
    "Le goût : identifie une seule sensation dans ta bouche.",
    "Termine en te disant : je suis ici, maintenant. Je n'ai rien à résoudre pendant ces quelques minutes.",
  ],
};

export const meditationObserverPensees: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Installe-toi et respire normalement. Ferme les yeux si tu es à l'aise.",
    "Pendant quelques minutes, tu ne vas pas chercher à arrêter tes pensées.",
    "Quand une pensée arrive, donne-lui simplement une étiquette mentale : « pensée » — puis laisse-la repartir.",
    "Si tu penses « les gens me regardent » : « pensée ». Retour à la respiration.",
    "Si tu penses « je vais être ridicule » : « pensée ». Retour à la respiration.",
    "Tu n'essaies pas de supprimer la pensée. Tu apprends la différence entre avoir une pensée et devoir agir selon elle.",
    "Pour finir, inspire doucement, expire, et dis-toi : une pensée n'est pas forcément un fait.",
  ],
};

export const meditationScanCorporel: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Assieds-toi ou allonge-toi. Commence par tes pieds : chaleur, froid, tension, contact avec le sol.",
    "Remonte vers tes jambes — mollets, cuisses. Observe simplement, sans rien changer.",
    "Ton ventre : observe le mouvement de ta respiration à cet endroit.",
    "Ta poitrine : observe la respiration qui continue, sans effort.",
    "Tes épaules : sont-elles contractées ? Laisse-les descendre légèrement.",
    "Ta mâchoire : desserre les dents, laisse la langue se détendre.",
    "Ton visage : relâche le front, les yeux, les joues, la bouche.",
    "Termine en observant ton corps comme un ensemble. Tu n'as pas besoin de supprimer toutes les sensations — tu peux simplement les laisser être là.",
  ],
};
