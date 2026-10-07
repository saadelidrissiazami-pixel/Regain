import { lang } from '../../lib/i18n';

/**
 * How to actually do each activity, step by step.
 *
 * The catalogue already says what to do in the first two minutes and what ends it. That is enough
 * to start, and not always enough to finish: “draw with nothing to copy” still leaves somebody
 * holding a pencil over a blank page. These are the steps in between.
 *
 * They live here and not in Postgres, for the reason catalogue.ts sets out at length: wording in
 * the database makes the language of the interface a property of the *server*, so a migration
 * would change it for every installed build at once. The two sets of steps that were written as
 * migrations — 0012 and 0016 — are French-only for exactly that reason, and would have shown
 * French inside an English app. Both languages sit side by side here instead, so they are written
 * and reviewed as one thing.
 *
 * The register is the catalogue's: second person, concrete, and never a promise about how it will
 * feel. A step says what to do with your hands, not what you ought to get out of it.
 */

/** [icon, title, description] — a tuple, because three named fields over ~300 steps is all noise. */
type Row = [string, string, string];

export type ActivityStep = { icon: string; title: string; description: string };

/** Keyed by the title the database stores, which is French and does not move. */
const STEPS: Record<string, { fr: Row[]; en: Row[] }> = {
  // Move a little
  'Bouger sur une chanson': {
    fr: [
      ['🎵', 'Lance le morceau', 'Choisis-en un que tu connais par cœur : aucune décision à prendre une fois qu’il tourne.'],
      ['🙌', 'Commence par les mains', 'Assis ou debout, laisse les mains et les bras suivre le rythme. Le reste du corps vient tout seul, ou pas.'],
      ['🦶', 'Ajoute les appuis', 'Si l’envie est là, transfère ton poids d’un pied sur l’autre. C’est déjà danser.'],
    ],
    en: [
      ['🎵', 'Put the song on', 'Pick one you know by heart: once it is playing there is nothing left to decide.'],
      ['🙌', 'Start with your hands', 'Sitting or standing, let your hands and arms follow the beat. The rest of you joins in, or does not.'],
      ['🦶', 'Add your feet', 'If you feel like it, shift your weight from one foot to the other. That already counts as dancing.'],
    ],
  },
  'Marcher dans le logement': {
    fr: [
      ['🚪', 'Choisis ton passage', 'Un couloir, une pièce traversante, n’importe quel trajet dégagé d’un bout à l’autre.'],
      ['🚶', 'Fais le premier aller-retour', 'À ton allure. Il ne s’agit pas de faire vite, seulement d’être debout et en mouvement.'],
      ['🔁', 'Enchaîne jusqu’à cinq', 'Compte-les si ça t’aide. Au cinquième, c’est fini — t’arrêter avant reste une option.'],
    ],
    en: [
      ['🚪', 'Pick your stretch', 'A hallway, a room you can cross, any clear run from one end to the other.'],
      ['🚶', 'Walk the first lap', 'At your own pace. This is not about speed, only about being up and moving.'],
      ['🔁', 'Keep going to five', 'Count them if that helps. Five is the end — stopping sooner is still fine.'],
    ],
  },
  'Délier ses mains et ses épaules': {
    fr: [
      ['🤲', 'Ouvre et referme les mains', 'Dix fois, sans forcer. Les doigts s’écartent franchement, puis se relâchent.'],
      ['🔄', 'Fais tourner les poignets', 'Cinq cercles dans un sens, cinq dans l’autre. Lentement suffit.'],
      ['💪', 'Trois cercles d’épaules', 'Monte les épaules vers les oreilles, recule-les, laisse-les redescendre. C’est la fin.'],
    ],
    en: [
      ['🤲', 'Open and close your hands', 'Ten times, without forcing. Spread the fingers wide, then let them go soft.'],
      ['🔄', 'Circle your wrists', 'Five turns one way, five the other. Slowly is plenty.'],
      ['💪', 'Three shoulder circles', 'Lift your shoulders towards your ears, roll them back, let them drop. That is the end.'],
    ],
  },
  'Faire une petite boucle dehors': {
    fr: [
      ['👟', 'Chaussures et clés', 'Les deux seules choses nécessaires. Le téléphone est facultatif.'],
      ['➡️', 'Pars dans une direction', 'Celle que tu prends d’habitude, ou l’autre. Les deux marchent.'],
      ['↩️', 'Tourne au bout de quatre minutes', 'La moitié du temps à l’aller, la moitié au retour : la boucle se referme sans calcul.'],
      ['🚪', 'Repasse ta porte', 'C’est fini là, même si tu te sens d’en faire plus.'],
    ],
    en: [
      ['👟', 'Shoes and keys', 'The only two things you need. The phone is optional.'],
      ['➡️', 'Head off in one direction', 'The way you usually go, or the other one. Either works.'],
      ['↩️', 'Turn around after four minutes', 'Half the time out, half the time back: the loop closes without any arithmetic.'],
      ['🚪', 'Come back through your door', 'That is the end, even if you feel up to more.'],
    ],
  },
  'Danser deux morceaux': {
    fr: [
      ['📻', 'Prépare la sélection', 'Deux morceaux à la suite, choisis maintenant pour ne pas avoir à choisir après le premier.'],
      ['🕺', 'Premier morceau : échauffe-toi', 'Bouge petit. Les épaules, les hanches, rien d’ambitieux.'],
      ['🔥', 'Deuxième morceau : lâche-toi', 'Plus grand si l’envie vient. Personne ne regarde.'],
      ['🧘', 'Reprends ton souffle', 'Debout, quelques respirations, le temps que le cœur redescende.'],
    ],
    en: [
      ['📻', 'Line up the playlist', 'Two songs back to back, chosen now so you do not have to choose after the first.'],
      ['🕺', 'First song: warm up', 'Move small. Shoulders, hips, nothing ambitious.'],
      ['🔥', 'Second song: let go', 'Bigger, if it comes. Nobody is watching.'],
      ['🧘', 'Get your breath back', 'Standing, a few breaths, long enough for your heart to settle.'],
    ],
  },

  // Get some air
  "Prendre l'air juste devant": {
    fr: [
      ['🧥', 'Prends une veste', 'Même pour cinq minutes. Avoir froid est la raison la plus bête de rentrer.'],
      ['🚶', 'Sors jusqu’au premier arrêt possible', 'Le pas de la porte, le bout de la rue, le palier côté cour. C’est assez loin.'],
      ['🌬️', 'Reste cinq minutes', 'Debout ou assis, immobile si tu veux. Il n’y a rien à faire d’autre qu’être dehors.'],
    ],
    en: [
      ['🧥', 'Grab a jacket', 'Even for five minutes. Being cold is the silliest reason to go back in.'],
      ['🚶', 'Go as far as the first place you can stop', 'The doorstep, the end of the street, the back landing. That is far enough.'],
      ['🌬️', 'Stay five minutes', 'Standing or sitting, still if you like. There is nothing to do but be outside.'],
    ],
  },
  'Repérer trois détails dehors': {
    fr: [
      ['🎨', 'Une couleur', 'La première qui attire ton regard. Une porte, un vêtement, une enseigne.'],
      ['👂', 'Un son', 'Ferme les yeux une seconde si ça aide. Un moteur, un oiseau, une conversation au loin.'],
      ['🔍', 'Un détail que tu n’avais jamais vu', 'Une date gravée, une fissure, une plante sur un rebord. Il y en a toujours un.'],
    ],
    en: [
      ['🎨', 'One colour', 'The first that catches your eye. A door, a coat, a shop sign.'],
      ['👂', 'One sound', 'Shut your eyes for a second if it helps. An engine, a bird, a conversation further off.'],
      ['🔍', 'One detail you had never noticed', 'A carved date, a crack, a plant on a ledge. There is always one.'],
    ],
  },
  "S'asseoir quelques minutes dehors": {
    fr: [
      ['🧥', 'Veste, puis le banc le plus proche', 'Une marche, un muret, le rebord d’une jardinière : tout fait l’affaire.'],
      ['📱', 'Range le téléphone', 'Dans une poche, écran contre la cuisse. Il n’a rien à faire ici.'],
      ['👀', 'Laisse ton regard se poser', 'Sur ce qui passe, ou sur rien. Tu n’as aucune observation à ramener.'],
      ['🚪', 'Rentre quand tu en as envie', 'Pas quand une durée est atteinte. C’est toi qui décides de la fin.'],
    ],
    en: [
      ['🧥', 'Jacket, then the nearest bench', 'A step, a low wall, the edge of a planter: any of them will do.'],
      ['📱', 'Put the phone away', 'In a pocket, screen against your leg. It has no business here.'],
      ['👀', 'Let your eyes settle', 'On whatever goes past, or on nothing. You owe nobody an observation.'],
      ['🚪', 'Go back in when you want to', 'Not when a timer says so. You decide when this ends.'],
    ],
  },
  'Rejoindre un coin de verdure': {
    fr: [
      ['🗺️', 'Choisis ta destination', 'Le parc, le square, la rangée d’arbres au bout de l’avenue. Le plus proche gagne.'],
      ['👟', 'Pars sans optimiser le trajet', 'Le chemin que tu connais, même s’il n’est pas le plus court.'],
      ['🌳', 'Arrive et arrête-toi', 'Une minute sur place, debout ou assis. C’est le moment qui compte, pas la marche.'],
      ['↩️', 'Le retour est un bonus', 'Bus, métro, appel à quelqu’un : rentrer autrement ne retire rien à ce qui est fait.'],
    ],
    en: [
      ['🗺️', 'Pick where you are going', 'The park, the square, the row of trees at the end of the avenue. Nearest wins.'],
      ['👟', 'Go without optimising the route', 'The way you know, even if it is not the shortest.'],
      ['🌳', 'Arrive, and stop', 'A minute once you are there, standing or sitting. The arriving is the point, not the walk.'],
      ['↩️', 'The way back is a bonus', 'Bus, metro, a phone call to someone: coming home another way takes nothing away.'],
    ],
  },

  // At home
  'Libérer un coin de table': {
    fr: [
      ['📐', 'Délimite le coin', 'Un carré de la taille d’un set de table. Pas la table entière.'],
      ['👜', 'Sors le premier objet', 'Celui du dessus, sans réfléchir à où il va finir.'],
      ['🧽', 'Passe un coup', 'Une éponge, un chiffon, une manche. Trois secondes suffisent.'],
      ['✋', 'Arrête-toi là', 'Le reste de la table attendra. Le coin dégagé est le résultat, pas une mise en bouche.'],
    ],
    en: [
      ['📐', 'Mark out the corner', 'A square about the size of a placemat. Not the whole table.'],
      ['👜', 'Lift off the first thing', 'The one on top, without working out where it will end up.'],
      ['🧽', 'Give it a wipe', 'A sponge, a cloth, your sleeve. Three seconds will do.'],
      ['✋', 'Stop there', 'The rest of the table can wait. The clear corner is the result, not a warm-up.'],
    ],
  },
  'Remettre cinq objets à leur place': {
    fr: [
      ['1️⃣', 'Commence par le plus évident', 'Celui dont tu connais la place sans hésiter. Il donne le départ.'],
      ['🔁', 'Trois autres, au hasard', 'Ne cherche pas les plus utiles. Ce qui est à portée de main fait l’affaire.'],
      ['5️⃣', 'Le cinquième, et c’est fini', 'Si un sixième se présente tout seul, tant mieux. Sinon, c’est terminé.'],
    ],
    en: [
      ['1️⃣', 'Start with the obvious one', 'The one whose place you know without thinking. It gets you going.'],
      ['🔁', 'Three more, any order', 'Do not look for the most useful ones. Whatever is within reach will do.'],
      ['5️⃣', 'The fifth, and you are done', 'If a sixth turns up by itself, good. If not, that is the end.'],
    ],
  },
  'Installer un coin confortable': {
    fr: [
      ['🛋️', 'Choisis l’endroit', 'Un fauteuil, un bout de canapé, un coin de lit. Celui où tu vas vraiment t’asseoir.'],
      ['🧸', 'Pose un coussin ou un plaid', 'Un seul objet suffit à transformer un endroit en place.'],
      ['💡', 'Baisse la lumière si elle est dure', 'Une lampe plutôt que le plafonnier, quand le choix existe.'],
      ['🪑', 'Assieds-toi dedans', 'C’est l’étape qui compte : un coin installé où personne ne s’assied n’a rien changé.'],
    ],
    en: [
      ['🛋️', 'Pick the spot', 'An armchair, one end of the sofa, a corner of the bed. The one you will actually sit in.'],
      ['🧸', 'Put down a cushion or a blanket', 'One object is enough to turn a spot into a place.'],
      ['💡', 'Soften the light if it is harsh', 'A lamp rather than the ceiling, where you have the choice.'],
      ['🪑', 'Sit down in it', 'This is the step that counts: a comfortable corner nobody sits in has changed nothing.'],
    ],
  },
  'Retrouver un objet auquel on tient': {
    fr: [
      ['📦', 'Va le chercher', 'Une photo, un cadeau, un billet gardé. Tu sais déjà lequel.'],
      ['🫳', 'Pose-le devant toi', 'Sur la table, à hauteur de regard. Pas dans la main : il doit pouvoir être regardé.'],
      ['👀', 'Regarde-le un moment', 'Sans chercher à ressentir quoi que ce soit de particulier.'],
      ['📍', 'Laisse-le en vue', 'Si tu veux. Un objet rangé aussitôt retourne à l’oubli.'],
    ],
    en: [
      ['📦', 'Go and get it', 'A photo, a gift, a ticket you kept. You already know which one.'],
      ['🫳', 'Set it down in front of you', 'On the table, at eye level. Not in your hand: it needs to be lookable-at.'],
      ['👀', 'Look at it for a while', 'Without trying to feel anything in particular.'],
      ['📍', 'Leave it out', 'If you want to. Something put straight back away goes straight back to being forgotten.'],
    ],
  },
  'Préparer quelque chose de chaud': {
    fr: [
      ['💧', 'Remplis la bouilloire ou la casserole', 'C’est déjà commencé. Le reste suit sans décision.'],
      ['☕', 'Choisis pendant que ça chauffe', 'Thé, infusion, chocolat, bouillon. La tasse aussi, si tu en as une préférée.'],
      ['🫖', 'Verse et attends', 'Les deux ou trois minutes d’infusion font partie de l’activité, elles ne sont pas du temps perdu.'],
      ['🪑', 'Bois assis', 'Debout dans la cuisine, ça passe trop vite pour compter.'],
    ],
    en: [
      ['💧', 'Fill the kettle or the pan', 'That is it started. The rest follows without another decision.'],
      ['☕', 'Choose while it heats', 'Tea, herbal, chocolate, broth. The mug too, if you have a favourite.'],
      ['🫖', 'Pour, and wait', 'The two or three minutes of brewing are part of the activity, not time lost.'],
      ['🪑', 'Drink it sitting down', 'Standing in the kitchen, it goes too fast to count.'],
    ],
  },

  // See someone, or just wave
  'Envoyer un petit bonjour': {
    fr: [
      ['👤', 'Choisis la personne', 'Celle à qui tu as pensé en lisant ça. Ne cherche pas plus loin.'],
      ['✍️', 'Écris une phrase', '« Je pensais à toi. » Rien à ajouter, rien à justifier.'],
      ['📤', 'Envoie', 'C’est fini à cet instant. Une réponse n’est pas la condition de la réussite.'],
    ],
    en: [
      ['👤', 'Pick the person', 'The one you thought of while reading this. Do not look further.'],
      ['✍️', 'Write one sentence', '“I was thinking of you.” Nothing to add, nothing to justify.'],
      ['📤', 'Send it', 'It is over at that moment. A reply is not what makes this count.'],
    ],
  },
  'Proposer un appel court': {
    fr: [
      ['⏱️', 'Annonce la durée', '« Un appel de dix minutes » : c’est ce qui rend la proposition facile à accepter.'],
      ['📅', 'Laisse le créneau ouvert', '« Un de ces soirs » plutôt qu’une date. Moins de friction des deux côtés.'],
      ['📤', 'Envoie sans relancer', 'La proposition est faite. Le reste ne dépend plus de toi.'],
    ],
    en: [
      ['⏱️', 'Say how long', '“A ten-minute call” is what makes the offer easy to say yes to.'],
      ['📅', 'Leave the time open', '“One of these evenings” rather than a date. Less friction on both sides.'],
      ['📤', 'Send it and leave it', 'The offer is made. The rest is no longer yours to carry.'],
    ],
  },
  'Envoyer un message vocal': {
    fr: [
      ['🎙️', 'Appuie et dis bonjour', 'La première phrase est la seule difficile. Elle peut être banale.'],
      ['🗣️', 'Raconte une chose', 'Ce que tu as fait aujourd’hui, ce qu’il y a par la fenêtre. Trente secondes suffisent.'],
      ['📤', 'Envoie sans réécouter', 'Te réécouter est la meilleure façon de ne jamais l’envoyer.'],
    ],
    en: [
      ['🎙️', 'Press record and say hello', 'The first sentence is the only hard one. It is allowed to be ordinary.'],
      ['🗣️', 'Tell them one thing', 'What you did today, what is out of the window. Thirty seconds is plenty.'],
      ['📤', 'Send it without listening back', 'Listening back is the surest way never to send it.'],
    ],
  },
  'Appeler dix minutes': {
    fr: [
      ['📞', 'Appelle à l’heure convenue', 'Ne repousse pas de cinq minutes : c’est comme ça qu’un appel n’a pas lieu.'],
      ['💬', 'Commence par une question simple', '« Tu fais quoi, là ? » lance la conversation sans rien exiger.'],
      ['⏱️', 'Regarde l’heure à dix minutes', 'Tu n’es pas obligé de raccrocher, seulement autorisé à le faire.'],
      ['👋', 'Raccroche sans te justifier', '« Je te laisse, à bientôt » suffit. Écourter n’est pas un manque.'],
    ],
    en: [
      ['📞', 'Call at the agreed time', 'Do not push it back five minutes: that is how a call ends up not happening.'],
      ['💬', 'Open with something easy', '“What are you up to?” starts the conversation without demanding anything.'],
      ['⏱️', 'Check the time at ten minutes', 'You are not obliged to hang up, only allowed to.'],
      ['👋', 'Hang up without explaining', '“I will let you go, speak soon” is enough. Keeping it short is not a failing.'],
    ],
  },
  'Partager une boisson': {
    fr: [
      ['🪑', 'Installe-toi avant l’heure', 'Arriver posé change le début de la conversation.'],
      ['🥤', 'Choisis ta boisson', 'Avec ou sans alcool, peu importe. C’est le moment qui est partagé.'],
      ['📱', 'Téléphone face cachée', 'Sur la table, écran contre le bois. Il reste joignable sans être présent.'],
      ['🏁', 'La fin, c’est le verre fini', 'Pas une durée. Si vous repartez pour un deuxième, c’est du bonus.'],
    ],
    en: [
      ['🪑', 'Get there before the time', 'Arriving already settled changes how the conversation starts.'],
      ['🥤', 'Choose your drink', 'With or without alcohol, it makes no difference. The moment is the shared part.'],
      ['📱', 'Phone face down', 'On the table, screen against the wood. Still reachable without being present.'],
      ['🏁', 'The empty glass is the end', 'Not a length of time. If you go round again, that is a bonus.'],
    ],
  },
  "Écrire à quelqu'un qu'on a perdu de vue": {
    fr: [
      ['🙅', 'N’explique pas le silence', 'C’est la phrase qui bloque tout le message. Elle n’est attendue par personne.'],
      ['✍️', 'Écris la version courte', '« Je pensais à toi, comment tu vas ? » Rien de plus.'],
      ['📤', 'Envoie dans la minute', 'Un brouillon gardé pour « plus tard » ne part jamais.'],
      ['🤷', 'Laisse la réponse venir ou non', 'Ce que tu contrôlais était l’envoi, et c’est fait.'],
    ],
    en: [
      ['🙅', 'Do not explain the silence', 'That is the sentence that jams the whole message. Nobody is waiting for it.'],
      ['✍️', 'Write the short version', '“I was thinking of you, how are you?” Nothing more.'],
      ['📤', 'Send it within the minute', 'A draft kept for “later” never goes.'],
      ['🤷', 'Let the reply come, or not', 'The part you controlled was sending it, and that is done.'],
    ],
  },

  // Settle down
  'Écouter un morceau sans rien faire': {
    fr: [
      ['🎧', 'Choisis un morceau familier', 'Pas une découverte : un morceau connu demande moins d’attention.'],
      ['📱', 'Pose le téléphone hors de tes mains', 'Sur la table, pas sur les genoux. Les mains libres changent la posture.'],
      ['👂', 'Écoute jusqu’au bout', 'Sans rien faire d’autre. Si tu décroches, c’est normal — reviens au son.'],
    ],
    en: [
      ['🎧', 'Pick a familiar track', 'Not something new: a song you know asks less of your attention.'],
      ['📱', 'Put the phone out of your hands', 'On the table, not on your lap. Free hands change how you sit.'],
      ['👂', 'Listen to the end', 'Doing nothing else. If you drift off, that is normal — come back to the sound.'],
    ],
  },
  'Passer un gant tiède sur ses mains': {
    fr: [
      ['🚿', 'Humidifie le gant', 'Une eau agréable, ni brûlante ni froide. Essore-le à peine.'],
      ['🫳', 'Commence par le dos des mains', 'Lentement, d’un poignet vers les doigts.'],
      ['✋', 'Puis les paumes et entre les doigts', 'C’est la partie qu’on oublie, et c’est celle qui tient le plus de tension.'],
      ['🌬️', 'Laisse sécher à l’air', 'Sans frotter avec une serviette. La fin, c’est quand les mains sont sèches.'],
    ],
    en: [
      ['🚿', 'Wet the cloth', 'Water that feels good, neither hot nor cold. Barely wring it out.'],
      ['🫳', 'Start with the backs of your hands', 'Slowly, from a wrist towards the fingers.'],
      ['✋', 'Then the palms and between the fingers', 'That is the part people skip, and the part holding the most tension.'],
      ['🌬️', 'Let them air-dry', 'Without rubbing them on a towel. Dry hands are the end.'],
    ],
  },
  'Desserrer ses mains et sa mâchoire': {
    fr: [
      ['🫴', 'Pose les mains sur un support', 'Les cuisses, une table. Laisse les doigts s’ouvrir d’eux-mêmes.'],
      ['😮', 'Desserre les dents', 'Les mâchoires se touchent toute la journée sans qu’on le remarque. Laisse un espace.'],
      ['👅', 'Décolle la langue du palais', 'Petit détail, effet immédiat sur toute la mâchoire.'],
      ['🌬️', 'Trois respirations tranquilles', 'Sans compter ni allonger. C’est fini après la troisième.'],
    ],
    en: [
      ['🫴', 'Rest your hands on something', 'Your thighs, a table. Let the fingers open on their own.'],
      ['😮', 'Unclench your teeth', 'Jaws touch all day without anyone noticing. Leave a gap.'],
      ['👅', 'Drop your tongue from the roof of your mouth', 'A small detail, and the whole jaw follows.'],
      ['🌬️', 'Three easy breaths', 'Without counting or lengthening them. After the third, you are done.'],
    ],
  },
  'Regarder dehors par la fenêtre': {
    fr: [
      ['🪟', 'Installe-toi près de la fenêtre', 'Assis si possible. Debout, on repart au bout de vingt secondes.'],
      ['👀', 'Suis une chose du regard', 'Une personne qui passe, un nuage, une branche qui bouge. Jusqu’à ce qu’elle sorte du cadre.'],
      ['🔁', 'Recommence deux fois', 'Trois choses suivies, et c’est terminé.'],
    ],
    en: [
      ['🪟', 'Settle by the window', 'Sitting if you can. Standing, you leave after twenty seconds.'],
      ['👀', 'Follow one thing with your eyes', 'Someone passing, a cloud, a branch moving. Until it leaves the frame.'],
      ['🔁', 'Do it twice more', 'Three things followed, and that is the end.'],
    ],
  },
  'Prendre une douche sans se presser': {
    fr: [
      ['🚿', 'Fais couler et laisse chauffer', 'Tu n’as rien d’autre à décider pendant ce temps.'],
      ['⏳', 'Reste une minute sans rien faire', 'Avant le savon. C’est la minute qui distingue cette douche des autres.'],
      ['🧴', 'Fais les gestes dans l’ordre habituel', 'Rien à changer. L’habitude est ce qui permet de ne pas réfléchir.'],
      ['🧖', 'Sors sans te presser', 'Sèche-toi assis si tu veux. La fin, c’est quand tu sors.'],
    ],
    en: [
      ['🚿', 'Run the water and let it warm', 'There is nothing else to decide while it does.'],
      ['⏳', 'Stand there a minute doing nothing', 'Before the soap. That minute is what makes this shower different.'],
      ['🧴', 'Go through the usual order', 'Nothing to change. The habit is what lets you not think.'],
      ['🧖', 'Step out unhurried', 'Dry off sitting down if you like. Stepping out is the end.'],
    ],
  },

  // Meditation — these open a guided session; the steps say how to get into it.
  "Sentir un point d'appui": {
    fr: [
      ['▶️', 'Lance la séance', 'La voix et la minuterie s’occupent du reste.'],
      ['🫳', 'Choisis un contact', 'Les mains sur les cuisses, les pieds au sol, le dos contre le dossier. Un seul.'],
      ['🔁', 'Reviens-y quand tu pars', 'Tu partiras. Revenir est l’exercice, pas l’échec.'],
    ],
    en: [
      ['▶️', 'Start the session', 'The voice and the timer take care of the rest.'],
      ['🫳', 'Pick one point of contact', 'Hands on your thighs, feet on the floor, back against the chair. Just one.'],
      ['🔁', 'Come back to it when you drift', 'You will drift. Coming back is the exercise, not the failure.'],
    ],
  },
  'Écouter les sons autour de soi': {
    fr: [
      ['▶️', 'Lance la séance', 'Les yeux peuvent rester ouverts : cette séance-là n’a pas besoin du noir.'],
      ['👂', 'Repère le son le plus proche', 'Ta propre respiration compte.'],
      ['🌍', 'Puis le plus lointain', 'Et laisse les deux coexister, sans choisir.'],
    ],
    en: [
      ['▶️', 'Start the session', 'Your eyes can stay open: this one does not need the dark.'],
      ['👂', 'Find the nearest sound', 'Your own breathing counts.'],
      ['🌍', 'Then the furthest one', 'And let the two sit together, without choosing.'],
    ],
  },
  'Observer quelques respirations': {
    fr: [
      ['▶️', 'Lance la séance', 'Assis, debout, allongé : la position n’a pas d’importance.'],
      ['🌬️', 'Remarque une respiration', 'Sans l’allonger ni la ralentir. Elle est déjà en train de se faire.'],
      ['👃', 'Choisis où tu la sens', 'Les narines, la poitrine, le ventre. Reste au même endroit.'],
    ],
    en: [
      ['▶️', 'Start the session', 'Sitting, standing, lying down: the position does not matter.'],
      ['🌬️', 'Notice one breath', 'Without lengthening or slowing it. It is already happening.'],
      ['👃', 'Choose where you feel it', 'Nostrils, chest, belly. Stay in the same place.'],
    ],
  },
  'Revenir à une sensation': {
    fr: [
      ['🫳', 'Choisis ton repère avant de lancer', 'Les mains ou les pieds. Décider après coup fait perdre le début.'],
      ['▶️', 'Lance la séance', 'Et laisse-la t’emmener.'],
      ['🔁', 'Reviens au repère à chaque fois', 'Dix fois dans la séance, c’est une séance réussie.'],
    ],
    en: [
      ['🫳', 'Choose your anchor before you start', 'Hands or feet. Deciding afterwards costs you the opening.'],
      ['▶️', 'Start the session', 'And let it carry you.'],
      ['🔁', 'Return to the anchor each time', 'Ten times in one session is a session that worked.'],
    ],
  },

  // Find your footing
  'Noter une chose agréable': {
    fr: [
      ['📄', 'Prends un papier', 'Pas le téléphone : la main qui écrit va plus lentement que la tête.'],
      ['✍️', 'Écris le début de la phrase', '« Aujourd’hui, j’ai apprécié… » — la fin viendra, ou pas.'],
      ['🤏', 'Accepte le minuscule', 'Un café chaud, un trajet sans encombre. L’échelle n’a aucune importance.'],
      ['🙅', 'Si rien ne vient, passe', 'Forcer transforme l’exercice en examen. Il n’y a rien à prouver.'],
    ],
    en: [
      ['📄', 'Take a piece of paper', 'Not the phone: a writing hand goes slower than a head does.'],
      ['✍️', 'Write the start of the sentence', '“Today, I liked…” — the end will come, or it will not.'],
      ['🤏', 'Let it be tiny', 'A hot coffee, a journey with no hold-ups. The scale does not matter at all.'],
      ['🙅', 'If nothing comes, skip it', 'Forcing it turns the exercise into an exam. There is nothing to prove.'],
    ],
  },
  'Nommer ce dont on a besoin': {
    fr: [
      ['📝', 'Écris les cinq mots', 'Repos, compagnie, calme, mouvement, autre chose.'],
      ['⭕', 'Entoures-en un', 'Le premier qui s’impose. Le deuxième choix est en général une correction polie.'],
      ['🤐', 'Tu n’as rien à en faire', 'Nommer suffit. Agir dessus est une autre activité, pour un autre moment.'],
    ],
    en: [
      ['📝', 'Write the five words down', 'Rest, company, quiet, movement, something else.'],
      ['⭕', 'Circle one', 'The first that stands out. A second choice is usually a polite correction.'],
      ['🤐', 'You do not have to act on it', 'Naming it is enough. Doing something about it is another activity, another time.'],
    ],
  },
  'Préparer un petit geste pour demain': {
    fr: [
      ['🔮', 'Pense à demain matin', 'Pas à la semaine. Un seul moment, le plus proche.'],
      ['📦', 'Sors l’objet maintenant', 'Un livre, une tenue, une tasse, des chaussures près de la porte.'],
      ['📍', 'Mets-le sur le chemin', 'Là où tu passeras forcément. Un objet rangé ne sert à rien.'],
    ],
    en: [
      ['🔮', 'Think about tomorrow morning', 'Not the week. One moment, the nearest one.'],
      ['📦', 'Get the thing out now', 'A book, an outfit, a mug, shoes by the door.'],
      ['📍', 'Put it in your way', 'Where you are bound to pass. Something put away is no use.'],
    ],
  },
  'Écrire une phrase pour poser une limite': {
    fr: [
      ['✅', 'Commence par ce que tu peux', '« Je peux… » en premier : une limite qui ouvre quelque chose est plus facile à dire.'],
      ['🚧', 'Puis ce que tu ne peux pas', '« Aujourd’hui, je ne peux pas… » Le mot « aujourd’hui » fait tout le travail.'],
      ['📄', 'Relis à voix basse', 'Si c’est plus long que deux phrases, coupe.'],
      ['🤷', 'L’envoyer est facultatif', 'L’avoir écrite est déjà l’avoir pensée clairement.'],
    ],
    en: [
      ['✅', 'Start with what you can do', '“I can…” first: a limit that opens something is easier to say.'],
      ['🚧', 'Then what you cannot', '“Today, I cannot…” The word “today” does all the work.'],
      ['📄', 'Read it back under your breath', 'If it runs past two sentences, cut.'],
      ['🤷', 'Sending it is optional', 'Having written it is already having thought it clearly.'],
    ],
  },
  "Relire ce qu'on a déjà fait": {
    fr: [
      ['📊', 'Ouvre ton suivi', 'La semaine dernière, pas le mois. Une fenêtre courte se lit sans se décourager.'],
      ['3️⃣', 'Compte trois choses faites', 'Trois suffisent. Au-delà, on se met à chercher ce qui manque.'],
      ['🙅', 'Ne regarde pas les trous', 'Les jours vides ne sont pas l’objet de cette activité.'],
    ],
    en: [
      ['📊', 'Open your tracking', 'Last week, not the month. A short window reads without discouraging.'],
      ['3️⃣', 'Count three things you did', 'Three is enough. Past that, you start hunting for what is missing.'],
      ['🙅', 'Do not look at the gaps', 'The empty days are not what this activity is for.'],
    ],
  },

  // Recover
  'Se reposer sans chercher à dormir': {
    fr: [
      ['📱', 'Téléphone hors de portée', 'Dans une autre pièce si possible. À portée de main, il finit dans la main.'],
      ['🛏️', 'Installe-toi sur le dos', 'Un coussin sous les genoux si le bas du dos tire.'],
      ['😌', 'Ferme les yeux sans viser le sommeil', 'Chercher à dormir est ce qui empêche de dormir. Se reposer suffit.'],
      ['🧍', 'Relève-toi quand tu en as envie', 'Même après trois minutes.'],
    ],
    en: [
      ['📱', 'Phone out of reach', 'Another room if you can. Within reach, it ends up in your hand.'],
      ['🛏️', 'Lie on your back', 'A cushion under your knees if your lower back pulls.'],
      ['😌', 'Close your eyes without aiming for sleep', 'Trying to sleep is what stops sleep. Resting is enough.'],
      ['🧍', 'Get up when you want to', 'Even after three minutes.'],
    ],
  },
  'Faire une pause sans écran': {
    fr: [
      ['📵', 'Téléphone face cachée', 'Retourné, pas éteint. Le geste compte plus que le réglage.'],
      ['👀', 'Laisse tes yeux se poser loin', 'Une fenêtre, le fond de la pièce. Les yeux fatiguent de regarder à trente centimètres.'],
      ['⏱️', 'Cinq minutes', 'Sans rien remplacer : ni podcast, ni radio, ni rangement.'],
    ],
    en: [
      ['📵', 'Phone face down', 'Turned over, not switched off. The gesture matters more than the setting.'],
      ['👀', 'Let your eyes rest far away', 'A window, the far wall. Eyes tire from looking at thirty centimetres.'],
      ['⏱️', 'Five minutes', 'With nothing swapped in: no podcast, no radio, no tidying.'],
    ],
  },
  'Reposer ses jambes': {
    fr: [
      ['🛋️', 'Assieds-toi ou allonge-toi', 'Le dos soutenu, pas en équilibre sur un bord.'],
      ['🦵', 'Surélève les jambes', 'Sur un coussin, un pouf, le mur. Vingt centimètres suffisent.'],
      ['🦶', 'Fais tourner les chevilles', 'Cinq cercles de chaque côté, pour que le sang reparte.'],
      ['⏳', 'Reste jusqu’à ce qu’elles soient plus légères', 'C’est la seule fin, et elle se sent.'],
    ],
    en: [
      ['🛋️', 'Sit or lie down', 'Back supported, not balanced on an edge.'],
      ['🦵', 'Raise your legs', 'On a cushion, a stool, the wall. Twenty centimetres is enough.'],
      ['🦶', 'Circle your ankles', 'Five each way, to get the blood moving again.'],
      ['⏳', 'Stay until they feel lighter', 'That is the only ending, and you can feel it.'],
    ],
  },
  'Passer à une lumière plus douce': {
    fr: [
      ['💡', 'Éteins le plafonnier', 'C’est la lumière la plus dure de la pièce, presque toujours.'],
      ['🛋️', 'Allume une lampe basse', 'Lampadaire, lampe de chevet, guirlande. Au niveau des yeux ou en dessous.'],
      ['📱', 'Baisse aussi l’écran', 'Si tu en gardes un. Il devient la source la plus forte sinon.'],
    ],
    en: [
      ['💡', 'Turn the ceiling light off', 'It is the harshest light in the room, almost always.'],
      ['🛋️', 'Put a low lamp on', 'Floor lamp, bedside, string lights. At eye level or below.'],
      ['📱', 'Dim the screen too', 'If you are keeping one. Otherwise it becomes the brightest thing in the room.'],
    ],
  },
  'Prendre cinq minutes sans tâche': {
    fr: [
      ['🪑', 'Assieds-toi quelque part', 'N’importe où, du moment que tu n’es pas en train de faire autre chose.'],
      ['🙅', 'Rien à écouter, rien à produire', 'Pas de musique de fond, pas de « tant qu’à faire ».'],
      ['⏱️', 'Cinq minutes', 'C’est court. C’est aussi beaucoup plus long que ça en a l’air.'],
    ],
    en: [
      ['🪑', 'Sit down somewhere', 'Anywhere, as long as you are not also doing something else.'],
      ['🙅', 'Nothing to listen to, nothing to produce', 'No background music, no “while I am at it”.'],
      ['⏱️', 'Five minutes', 'It is short. It is also far longer than it sounds.'],
    ],
  },

  // Take your mind off things
  'Lire deux pages': {
    fr: [
      ['🔖', 'Reprends à la dernière page lue', 'Ne relis pas le chapitre d’avant : c’est comme ça qu’on ne reprend jamais.'],
      ['📵', 'Téléphone dans une autre pièce', 'Deux pages ne survivent pas à une notification.'],
      ['2️⃣', 'Arrête-toi à la deuxième', 'Continuer est un bonus, pas l’objectif. L’objectif est déjà atteint.'],
    ],
    en: [
      ['🔖', 'Pick up at the last page you read', 'Do not reread the chapter before: that is how people never pick up again.'],
      ['📵', 'Phone in another room', 'Two pages do not survive a notification.'],
      ['2️⃣', 'Stop at the second', 'Carrying on is a bonus, not the goal. The goal is already met.'],
    ],
  },
  'Dessiner sans modèle': {
    fr: [
      ['✏️', 'Une feuille, un crayon', 'Le dos d’une enveloppe fait l’affaire. Le beau carnet intimide.'],
      ['〰️', 'Trace une ligne sans intention', 'Elle n’a rien à représenter. C’est la seule règle.'],
      ['🔲', 'Remplis ce qu’elle a fermé', 'Hachures, points, aplats. Le dessin se construit tout seul à partir de là.'],
      ['✋', 'Arrête quand tu veux', 'Une feuille ratée est une feuille utilisée. Elle a servi.'],
    ],
    en: [
      ['✏️', 'One sheet, one pencil', 'The back of an envelope works. A nice notebook is intimidating.'],
      ['〰️', 'Draw a line with no intention', 'It does not have to represent anything. That is the only rule.'],
      ['🔲', 'Fill whatever it closed off', 'Hatching, dots, solid blocks. The drawing builds itself from there.'],
      ['✋', 'Stop whenever', 'A ruined page is a used page. It did its job.'],
    ],
  },
  'Faire quelques pièces de puzzle': {
    fr: [
      ['🧩', 'Installe-toi devant celui déjà sorti', 'Sortir un puzzle neuf est une autre activité, plus longue.'],
      ['🎨', 'Trie dix pièces par couleur', 'Trier est plus facile que placer, et ça lance la séance.'],
      ['✅', 'Place ce qui se place', 'Dix pièces, ou trois. La règle d’arrêt est généreuse exprès.'],
    ],
    en: [
      ['🧩', 'Sit at the one already out', 'Starting a new jigsaw is a different, longer activity.'],
      ['🎨', 'Sort ten pieces by colour', 'Sorting is easier than placing, and it gets you going.'],
      ['✅', 'Place whatever places', 'Ten pieces, or three. The stop rule is deliberately generous.'],
    ],
  },
  'Écouter une histoire courte': {
    fr: [
      ['🎧', 'Lance l’épisode déjà choisi', 'Choisir pendant la séance, c’est y passer la séance.'],
      ['📱', 'Pose l’écran', 'Face cachée, ou dans la poche. L’écoute se passe sans les yeux.'],
      ['🛋️', 'Installe-toi pour de bon', 'Debout dans la cuisine, on écoute à moitié.'],
    ],
    en: [
      ['🎧', 'Play the episode you already chose', 'Choosing during the session means spending the session choosing.'],
      ['📱', 'Put the screen down', 'Face down, or in a pocket. Listening happens without your eyes.'],
      ['🛋️', 'Settle in properly', 'Standing in the kitchen, you only half-listen.'],
    ],
  },
  'Lire quelques pages de BD': {
    fr: [
      ['📚', 'Ouvre à n’importe quelle page', 'Une BD se reprend au milieu sans rien perdre. C’est son avantage.'],
      ['🖼️', 'Regarde les images avant de lire', 'Une planche se regarde entière avant de se lire case par case.'],
      ['📕', 'Referme quand tu veux', 'Il n’y a pas de chapitre à finir.'],
    ],
    en: [
      ['📚', 'Open it at any page', 'A comic picks up in the middle and loses nothing. That is its advantage.'],
      ['🖼️', 'Look before you read', 'A page is worth taking in whole before reading it panel by panel.'],
      ['📕', 'Close it whenever', 'There is no chapter to finish.'],
    ],
  },
  'Regarder un épisode, exprès': {
    fr: [
      ['🎬', 'Choisis l’épisode avant de lancer', 'C’est ce qui sépare un choix d’un glissement de deux heures.'],
      ['⏭️', 'Coupe la lecture automatique', 'Dans les réglages de l’application. Une fois suffit pour toutes les fois suivantes.'],
      ['🍵', 'Prépare de quoi boire', 'Pour ne pas te lever au milieu et perdre le fil.'],
      ['🏁', 'Arrête au générique', 'C’était un choix, pas un glissement. Le générique est l’endroit où ça se vérifie.'],
    ],
    en: [
      ['🎬', 'Choose the episode before you press play', 'That is what separates a choice from a two-hour slide.'],
      ['⏭️', 'Turn autoplay off', 'In the app settings. Once covers every time after.'],
      ['🍵', 'Get something to drink first', 'So you do not get up halfway and lose the thread.'],
      ['🏁', 'Stop at the credits', 'It was a choice, not a slide. The credits are where that gets proved.'],
    ],
  },

  // The walks: the three activities that carry the route map and the neighbourhood panel.
  'Marcher une boucle près de chez soi': {
    fr: [
      ['📍', 'Laisse l’application proposer la boucle', 'Elle part de là où tu es et revient au même endroit : rien à préparer.'],
      ['👟', 'Pars sans mémoriser le trajet', 'Le tracé reste affiché. Tu peux y revenir à tout moment.'],
      ['🔄', 'Suis la boucle à ton allure', 'Elle est calculée sur la durée, pas sur une vitesse. Marcher lentement la raccourcit, c’est tout.'],
      ['🏠', 'Reviens à ton point de départ', 'C’est le seul intérêt d’une boucle : la fin est déjà chez toi.'],
    ],
    en: [
      ['📍', 'Let the app suggest the loop', 'It starts where you are and comes back to the same place: nothing to prepare.'],
      ['👟', 'Set off without memorising the route', 'The trace stays on screen. You can come back to it any time.'],
      ['🔄', 'Follow the loop at your own pace', 'It is built on time, not speed. Walking slowly just makes it shorter.'],
      ['🏠', 'Come back to where you started', 'That is the whole point of a loop: the end is already home.'],
    ],
  },
  "Découvrir une rue qu'on ne prend jamais": {
    fr: [
      ['🗺️', 'Regarde ce que l’application raconte', 'Quelques repères sur le quartier où tu te trouves, à vérifier sur place.'],
      ['↪️', 'Prends la première rue inconnue', 'Celle que tu longes sans jamais y tourner. Il y en a une à moins de cinq minutes.'],
      ['👀', 'Cherche trois choses à raconter', 'Une façade, un commerce, un nom de rue curieux. Trois suffisent.'],
      ['🧭', 'Rentre par où tu veux', 'Te perdre un peu fait partie de l’activité, pas de ses risques.'],
    ],
    en: [
      ['🗺️', 'Read what the app has on the area', 'A few landmarks about where you are, worth checking on the spot.'],
      ['↪️', 'Take the first street you do not know', 'The one you walk past and never turn into. There is one within five minutes.'],
      ['👀', 'Find three things worth telling someone', 'A façade, a shop, an odd street name. Three is enough.'],
      ['🧭', 'Come back whichever way you like', 'Getting slightly lost is part of the activity, not one of its risks.'],
    ],
  },
  'Marcher trente minutes en accélérant': {
    fr: [
      ['🚶', 'Cinq minutes tranquilles', 'Allure normale, le temps que les articulations suivent.'],
      ['🏃', 'Cinq minutes plus vite', 'Assez pour être légèrement essoufflé, pas assez pour ne plus pouvoir parler.'],
      ['🚶', 'Deux minutes de récupération', 'Allure normale, respiration profonde. Puis recommence : rapide, lent, rapide.'],
      ['🧘', 'Six minutes pour redescendre', 'Marche lente, épaules relâchées. Finir en soufflant n’apporte rien.'],
    ],
    en: [
      ['🚶', 'Five easy minutes', 'Normal pace, long enough for your joints to catch up.'],
      ['🏃', 'Five faster minutes', 'Enough to be slightly out of breath, not enough to stop you talking.'],
      ['🚶', 'Two minutes to recover', 'Normal pace, breathe deep. Then go again: fast, easy, fast.'],
      ['🧘', 'Six minutes to come down', 'Slow walk, shoulders loose. Finishing out of breath gains you nothing.'],
    ],
  },
};

/** The steps for one stored title, in the language this build speaks. */
export function stepsFor(storedTitle: string): ActivityStep[] | null {
  const entry = STEPS[storedTitle];
  if (!entry) return null;
  return (lang === 'fr' ? entry.fr : entry.en).map(([icon, title, description]) => ({ icon, title, description }));
}

/** Every stored title this file words, so a test can hold it against the catalogue. */
export const TITLES_WITH_STEPS = Object.keys(STEPS);

/** Both languages of one entry, for the test that keeps them the same shape. */
export function bothLanguages(storedTitle: string): { fr: Row[]; en: Row[] } | null {
  return STEPS[storedTitle] ?? null;
}
