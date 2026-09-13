import type { ProgramContent } from '../../src/features/wellbeing/types';

export const gratitudeExpress: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Quelle est une petite chose agréable qui s'est produite aujourd'hui ?",
    "Qui ou quoi vous a aidé, même un peu ?",
    "Que pourriez-vous vous dire, là, pour bien terminer la journée ?",
  ],
};

export const clarifierJournee: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Prenez un instant pour repenser à votre journée, sans jugement.",
    "Qu'est-ce qui a pris le plus de place aujourd'hui — dans votre temps, ou dans votre tête ?",
    "Y a-t-il un moment, même petit, qui vous a fait du bien ?",
    "Qu'aimeriez-vous faire différemment demain, si vous en aviez l'occasion ?",
    "Vous n'avez pas besoin d'écrire les réponses maintenant — laissez-les simplement infuser.",
  ],
};

export const viderSaTete: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Si votre tête est pleine, ce moment sert à en sortir un peu de contenu — pas à tout résoudre.",
    "Qu'est-ce qui tourne en boucle depuis un moment ?",
    "Est-ce une chose à faire, à décider, ou juste à ressentir ?",
    "Si c'est une chose à faire : quelle serait la toute première petite étape ?",
    "Si c'est une décision : qu'est-ce qui vous manque pour la prendre — du temps, une information, un avis ?",
    "Si c'est juste un ressenti : il n'a pas besoin d'être réglé maintenant, seulement remarqué.",
    "Une dernière chose : qu'est-ce qui, dans tout ça, ne vous appartient pas vraiment à porter ?",
  ],
};

export const dechargementMental: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Prends une feuille ou l'application Notes de ton téléphone, et mets un minuteur de 5 à 10 minutes.",
    "Écris absolument tout ce qui te traverse l'esprit — sans grammaire, sans structure, sans jugement.",
    "Même « je ne sais pas quoi écrire » compte. Continue.",
    "Une fois le temps écoulé, relis ce que tu as écrit et sépare-le en trois colonnes : ce qui est dans ta tête, ce qui est sous ton contrôle, ce qui ne l'est pas.",
    "Ta respiration, tes décisions et tes actions sont sous ton contrôle. Le passé et les réactions des autres ne le sont pas.",
    "Choisis une seule action, dans la colonne « sous mon contrôle ». Une seule suffit — par exemple « envoyer ce message ».",
  ],
};

export const journalDeConfiance: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Chaque soir, tu peux répondre à ces quelques questions, même en une phrase chacune.",
    "Qu'as-tu fait aujourd'hui malgré une difficulté ? Même quelque chose de petit.",
    "Quelle situation as-tu mieux gérée que tu ne l'aurais fait avant ?",
    "Qu'est-ce que cela dit de toi ? Par exemple : « je suis capable de continuer même inconfortable ».",
    "Quel petit acte de courage as-tu posé aujourd'hui — poser une question, dire non, essayer quelque chose de nouveau ?",
    "Quelle chose, petite et réalisable, vas-tu oser faire demain ?",
  ],
};

export const peurEnPlan: ProgramContent = {
  type: 'guided',
  paragraphs: [
    "Écris : de quoi ai-je peur, précisément ?",
    "Quel est le scénario catastrophe que ton cerveau imagine ? Sois précis·e.",
    "Quelle est la probabilité réelle que cela arrive ? Pas besoin d'un chiffre exact.",
    "Si cela arrivait quand même, que pourrais-tu faire ? Cherche trois solutions possibles.",
    "Qu'est-ce qui est réellement sous ton contrôle dans cette situation ?",
    "Termine par : je n'ai pas besoin d'être certain·e que tout se passera parfaitement. J'ai seulement besoin de savoir que je pourrai gérer ce qui arrivera.",
  ],
};
