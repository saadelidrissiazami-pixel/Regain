// English wording for the activity catalogue.
//
// The catalogue itself stays in the database: duration, energy, cost, tags and category are what
// the rule engine plans a week from, and they carry no language. Only the words a person reads
// live here, keyed by the row's stored title.
//
// This is deliberate. The app used to read its wording straight out of Postgres, which made the
// language of the interface a property of the *server* rather than of the installed build. A
// migration that translated those rows would change them for every version at once, including
// builds already in the App Store — that is exactly how a French build once ended up showing
// sessions it could not play. Keeping the wording in the bundle means a French build reads French
// and an English build reads English, from the same rows, forever.
//
// An unknown title falls through to whatever the database holds, so a row added later shows up
// in its original wording instead of disappearing.

type Wording = { title: string; firstAction: string; stopRule: string };

const WORDING_BY_STORED_TITLE: Record<string, Wording> = {
  // Move a little
  'Bouger sur une chanson': {
    title: 'Move to one song',
    firstAction: 'Put on a song you already know and start with your hands, sitting or standing.',
    stopRule: 'When the song ends.',
  },
  'Marcher dans le logement': {
    title: 'Walk around indoors',
    firstAction: 'Take one easy lap along a clear stretch of floor.',
    stopRule: 'After five laps.',
  },
  'Délier ses mains et ses épaules': {
    title: 'Loosen your hands and shoulders',
    firstAction: 'Settle in comfortably, then slowly open and close your hands ten times.',
    stopRule: 'Once your shoulders have made three circles.',
  },
  'Faire une petite boucle dehors': {
    title: 'Take a short loop outside',
    firstAction: 'Put your shoes on and pick up your keys. The rest follows on its own.',
    stopRule: 'When you come back through your door.',
  },
  'Danser deux morceaux': {
    title: 'Dance to two songs',
    firstAction: 'Start the first track of a playlist that is already made.',
    stopRule: 'When the second song ends.',
  },

  // Get some air
  "Prendre l'air juste devant": {
    title: 'Step out just outside',
    firstAction: 'Grab a jacket and go as far as the first place you can stop.',
    stopRule: 'After five minutes outside, even standing still.',
  },
  'Repérer trois détails dehors': {
    title: 'Spot three details outside',
    firstAction: 'From where you are, find one colour that catches your eye.',
    stopRule: 'When you have found all three.',
  },
  "S'asseoir quelques minutes dehors": {
    title: 'Sit outside for a few minutes',
    firstAction: 'Grab a jacket and settle on the nearest bench or step.',
    stopRule: 'Whenever you feel like going back in.',
  },
  'Rejoindre un coin de verdure': {
    title: 'Walk to some greenery',
    firstAction: 'Put your shoes on and head for the nearest green space.',
    stopRule: 'When you get there. The walk back is a bonus.',
  },

  // At home
  'Libérer un coin de table': {
    title: 'Clear one corner of a table',
    firstAction: 'Put away a single object from the surface you picked.',
    stopRule: 'When that corner is clear. The rest can wait.',
  },
  'Remettre cinq objets à leur place': {
    title: 'Put five things back',
    firstAction: 'Pick one object whose place you already know, and put it away.',
    stopRule: 'At the fifth object.',
  },
  'Installer un coin confortable': {
    title: 'Set up a comfortable spot',
    firstAction: 'Put a cushion or a blanket where you want to settle.',
    stopRule: 'When you sit down in it.',
  },
  'Retrouver un objet auquel on tient': {
    title: 'Find something you care about',
    firstAction: 'Take a photo or a familiar object and set it in front of you.',
    stopRule: 'Once you have looked at it for a while.',
  },
  'Préparer quelque chose de chaud': {
    title: 'Make something warm',
    firstAction: 'Fill the kettle or the pan. That is it started.',
    stopRule: 'When the cup is empty.',
  },

  // See someone, or just wave
  'Envoyer un petit bonjour': {
    title: 'Send a small hello',
    firstAction: 'Open a conversation and write “I was thinking of you”.',
    stopRule: 'When the message is sent. No reply is expected.',
  },
  'Proposer un appel court': {
    title: 'Offer a short call',
    firstAction: 'Write “Fancy a ten-minute call one of these evenings?”',
    stopRule: 'Once the invitation is sent.',
  },
  'Envoyer un message vocal': {
    title: 'Send a voice note',
    firstAction: 'Open a conversation with someone close and record a first sentence.',
    stopRule: 'When you send it, imperfect and all.',
  },
  'Appeler dix minutes': {
    title: 'Call for ten minutes',
    firstAction: 'Call the person this time was agreed with.',
    stopRule: 'After ten minutes, with no guilt about keeping it short.',
  },
  'Partager une boisson': {
    title: 'Share a drink',
    firstAction: 'At the agreed time, settle in and choose your drink.',
    stopRule: 'When the cup or the glass is finished.',
  },
  "Écrire à quelqu'un qu'on a perdu de vue": {
    title: 'Write to someone you have lost touch with',
    firstAction: 'Just write “I was thinking of you, how are you?” without explaining the silence.',
    stopRule: 'Once it is sent.',
  },

  // Settle down
  'Écouter un morceau sans rien faire': {
    title: 'Listen to one song, doing nothing',
    firstAction: 'Start a familiar track and put the phone out of your hands.',
    stopRule: 'When the song ends.',
  },
  'Passer un gant tiède sur ses mains': {
    title: 'Warm cloth over your hands',
    firstAction: 'Wet a cloth with water at a temperature that feels good.',
    stopRule: 'When your hands are dry.',
  },
  'Desserrer ses mains et sa mâchoire': {
    title: 'Unclench your hands and jaw',
    firstAction: 'Rest your hands on a surface and let the fingers loosen.',
    stopRule: 'After three easy breaths.',
  },
  'Regarder dehors par la fenêtre': {
    title: 'Look out of the window',
    firstAction: 'Settle near a window and notice one detail outside.',
    stopRule: 'When you have followed three things with your eyes.',
  },
  'Prendre une douche sans se presser': {
    title: 'Take an unhurried shower',
    firstAction: 'Run the water and let it warm up. There is nothing else to decide.',
    stopRule: 'When you step out.',
  },

  // Meditation: these open a guided session rather than repeating one.
  "Sentir un point d'appui": {
    title: 'Feel one point of contact',
    firstAction: 'Start the session and notice where your hands or your feet touch something.',
    stopRule: 'When the session ends.',
  },
  'Écouter les sons autour de soi': {
    title: 'Listen to the sounds around you',
    firstAction: 'Start the session and pick out a first sound, eyes open if you prefer.',
    stopRule: 'When the session ends.',
  },
  'Observer quelques respirations': {
    title: 'Watch a few breaths',
    firstAction: 'Start the session and notice one breath, without changing it.',
    stopRule: 'When the session ends.',
  },
  'Revenir à une sensation': {
    title: 'Come back to one sensation',
    firstAction: 'Choose your hands or your feet as your anchor, then start the session.',
    stopRule: 'When the session ends.',
  },

  // Find your footing
  'Noter une chose agréable': {
    title: 'Note one good thing',
    firstAction: 'Finish this on paper: “Today, I liked…”. If nothing comes, skip it.',
    stopRule: 'When one sentence is written.',
  },
  "Nommer ce dont on a besoin": {
    title: 'Name what you need',
    firstAction: 'Circle one word: rest, company, quiet, movement, something else.',
    stopRule: 'When the word is circled.',
  },
  'Préparer un petit geste pour demain': {
    title: 'Set one thing up for tomorrow',
    firstAction: 'Leave something useful within reach: a book, an outfit, a mug.',
    stopRule: 'When it is in place.',
  },
  'Écrire une phrase pour poser une limite': {
    title: 'Write one sentence that sets a limit',
    firstAction: 'Write “I can…”, then “Today, I cannot…”. You do not have to send it.',
    stopRule: 'When both sentences are written.',
  },
  "Relire ce qu'on a déjà fait": {
    title: 'Look back at what you have done',
    firstAction: 'Open your tracking and look at last week, without judging it.',
    stopRule: 'When you have seen three things you did.',
  },

  // Recover
  'Se reposer sans chercher à dormir': {
    title: 'Rest without trying to sleep',
    firstAction: 'Settle comfortably and put the phone out of reach.',
    stopRule: 'Whenever you feel like getting up.',
  },
  'Faire une pause sans écran': {
    title: 'Take a screen-free break',
    firstAction: 'Put the phone face down and let your eyes rest wherever they want.',
    stopRule: 'After five minutes.',
  },
  'Reposer ses jambes': {
    title: 'Rest your legs',
    firstAction: 'Sit or lie down with your legs well supported.',
    stopRule: 'When your legs feel lighter.',
  },
  'Passer à une lumière plus douce': {
    title: 'Switch to a softer light',
    firstAction: 'Turn off one bright light and keep something comfortable on.',
    stopRule: 'Once the light has changed.',
  },
  'Prendre cinq minutes sans tâche': {
    title: 'Take five minutes with no task',
    firstAction: 'Sit down and let the next task wait. Nothing to listen to, nothing to produce.',
    stopRule: 'After five minutes.',
  },

  // Take your mind off things
  'Lire deux pages': {
    title: 'Read two pages',
    firstAction: 'Open the book you have already started, at the last page you read.',
    stopRule: 'After two pages. Carrying on is a bonus.',
  },
  'Dessiner sans modèle': {
    title: 'Draw with nothing to copy',
    firstAction: 'Take a pencil and put one line on a sheet of paper.',
    stopRule: 'When the page suits you, or does not.',
  },
  'Faire quelques pièces de puzzle': {
    title: 'Do a few jigsaw pieces',
    firstAction: 'Sit down at the puzzle that is already out and pick up a piece.',
    stopRule: 'After ten pieces placed, or sooner.',
  },
  'Écouter une histoire courte': {
    title: 'Listen to a short story',
    firstAction: 'Play an episode you have already chosen and put the screen down.',
    stopRule: 'When the episode ends.',
  },
  'Lire quelques pages de BD': {
    title: 'Read a few pages of a comic',
    firstAction: 'Open any comic you have, at any page.',
    stopRule: 'When you close it.',
  },
  'Regarder un épisode, exprès': {
    title: 'Watch one episode, on purpose',
    firstAction: 'Choose the episode in advance, then play it.',
    stopRule: 'When the episode ends: it was a choice, not a slide.',
  },
};

/** The stored titles this build knows how to word in English. */
export const LOCALISED_ACTIVITY_TITLES = Object.keys(WORDING_BY_STORED_TITLE);

type WithWording = {
  title: string;
  first_action?: string | null;
  stop_rule?: string | null;
};

/**
 * English wording for one catalogue row, leaving every other field alone.
 * A row this build has no wording for keeps the text the database gave it.
 */
export function localiseActivity<T extends WithWording>(activity: T): T {
  const wording = WORDING_BY_STORED_TITLE[activity.title];
  if (!wording) return activity;
  return {
    ...activity,
    title: wording.title,
    first_action: wording.firstAction,
    stop_rule: wording.stopRule,
  };
}
