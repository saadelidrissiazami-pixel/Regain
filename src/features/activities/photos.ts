import { englishTitle } from './catalogue';

/**
 * The file name of each activity's photograph.
 *
 * Written down rather than derived, for the reason the exercises learned the hard way: a slug
 * computed from a name that goes through t() looks for a French file on a French phone, finds
 * nothing, and falls back silently — which is how fifty-six photographs went missing in one
 * language and in no test.
 *
 * The key here is the title the *database* stores, which is French and does not move. The slug
 * comes from the English wording, so the files are readable to anyone looking in the directory.
 *
 * Generated once from the catalogue, then owned by hand: a new activity needs a line here, and
 * scripts/activity-photos.mjs refuses to run until it has one.
 */
export const ACTIVITY_PHOTOS: Record<string, string> = {
  'Bouger sur une chanson': 'move-to-one-song',
  'Marcher dans le logement': 'walk-around-indoors',
  'Délier ses mains et ses épaules': 'loosen-your-hands-and-shoulders',
  'Faire une petite boucle dehors': 'take-a-short-loop-outside',
  'Danser deux morceaux': 'dance-to-two-songs',
  "Prendre l'air juste devant": 'step-out-just-outside',
  'Repérer trois détails dehors': 'spot-three-details-outside',
  "S'asseoir quelques minutes dehors": 'sit-outside-for-a-few-minutes',
  'Rejoindre un coin de verdure': 'walk-to-some-greenery',
  'Libérer un coin de table': 'clear-one-corner-of-a-table',
  'Remettre cinq objets à leur place': 'put-five-things-back',
  'Installer un coin confortable': 'set-up-a-comfortable-spot',
  'Retrouver un objet auquel on tient': 'find-something-you-care-about',
  'Préparer quelque chose de chaud': 'make-something-warm',
  'Envoyer un petit bonjour': 'send-a-small-hello',
  'Proposer un appel court': 'offer-a-short-call',
  'Envoyer un message vocal': 'send-a-voice-note',
  'Appeler dix minutes': 'call-for-ten-minutes',
  'Partager une boisson': 'share-a-drink',
  "Écrire à quelqu'un qu'on a perdu de vue": 'write-to-someone-you-have-lost-touch-with',
  'Écouter un morceau sans rien faire': 'listen-to-one-song-doing-nothing',
  'Passer un gant tiède sur ses mains': 'warm-cloth-over-your-hands',
  'Desserrer ses mains et sa mâchoire': 'unclench-your-hands-and-jaw',
  'Regarder dehors par la fenêtre': 'look-out-of-the-window',
  'Prendre une douche sans se presser': 'take-an-unhurried-shower',
  "Sentir un point d'appui": 'feel-one-point-of-contact',
  'Écouter les sons autour de soi': 'listen-to-the-sounds-around-you',
  'Observer quelques respirations': 'watch-a-few-breaths',
  'Revenir à une sensation': 'come-back-to-one-sensation',
  'Noter une chose agréable': 'note-one-good-thing',
  'Nommer ce dont on a besoin': 'name-what-you-need',
  'Préparer un petit geste pour demain': 'set-one-thing-up-for-tomorrow',
  'Écrire une phrase pour poser une limite': 'write-one-sentence-that-sets-a-limit',
  "Relire ce qu'on a déjà fait": 'look-back-at-what-you-have-done',
  'Se reposer sans chercher à dormir': 'rest-without-trying-to-sleep',
  'Faire une pause sans écran': 'take-a-screen-free-break',
  'Reposer ses jambes': 'rest-your-legs',
  'Passer à une lumière plus douce': 'switch-to-a-softer-light',
  'Prendre cinq minutes sans tâche': 'take-five-minutes-with-no-task',
  'Lire deux pages': 'read-two-pages',
  'Dessiner sans modèle': 'draw-with-nothing-to-copy',
  'Faire quelques pièces de puzzle': 'do-a-few-jigsaw-pieces',
  'Écouter une histoire courte': 'listen-to-a-short-story',
  'Lire quelques pages de BD': 'read-a-few-pages-of-a-comic',
  'Regarder un épisode, exprès': 'watch-one-episode-on-purpose',
  'Marcher une boucle près de chez soi': 'walk-a-loop-near-home',
  "Découvrir une rue qu'on ne prend jamais": 'find-a-street-you-never-take',
  'Marcher trente minutes en accélérant': 'walk-thirty-minutes-picking-up-the-pace',
};

export { englishTitle };
