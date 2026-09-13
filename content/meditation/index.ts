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
