import { lang } from '../../lib/i18n';

/**
 * How to perform each exercise: getting into position, the movement, and the usual mistake.
 *
 * The catalogue already carries one coaching line per exercise, which is what the player shows
 * while a set is running. One line is the right amount there — the screen is full, and somebody
 * mid-set is not reading. These are for the rest screen instead, where there is a minute of
 * nothing to do and the next exercise has just been named.
 *
 * Keyed by slug, not by name: `name` goes through t(), so on a French phone it reads “Squat au
 * poids du corps”. That is exactly how all fifty-six photographs went missing in French. The slug
 * is written down in the catalogue and does not move.
 *
 * Both languages sit on the same entry, like the activity steps and the food table, so they are
 * written and reviewed as one thing rather than drifting apart in a dictionary.
 *
 * The third cue names the mistake *and* its correction. That is the opposite of what works on an
 * image model — "do not lock the knees" produced locked knees twice — but a person reading
 * "people usually round the back here; keep the chest up" takes both halves.
 */

/** [mise en place, exécution, erreur fréquente] */
type Cue = [string, string, string];

export type ExerciseCue = { setup: string; execute: string; mistake: string };

const CUES: Record<string, { fr: Cue; en: Cue }> = {
  // Jambes
  'bodyweight-squat': {
    fr: [
      'Pieds écartés de la largeur des épaules, pointes légèrement vers l’extérieur.',
      'Descends comme pour t’asseoir sur une chaise, poitrine haute, jusqu’où tu peux sans arrondir le bas du dos.',
      'Les genoux rentrent vers l’intérieur en remontant : pousse-les vers l’extérieur, dans l’axe des pieds.',
    ],
    en: [
      'Feet about shoulder-width apart, toes turned out a little.',
      'Sit down as if a chair were behind you, chest up, as far as you can go without rounding your lower back.',
      'Knees collapse inwards on the way up: push them out, in line with your toes.',
    ],
  },
  'wall-sit': {
    fr: [
      'Dos à plat contre le mur, pieds avancés d’un pas et demi.',
      'Glisse jusqu’à ce que tes cuisses soient parallèles au sol, et respire calmement.',
      'On retient son souffle sans s’en rendre compte : compte les respirations à voix basse.',
    ],
    en: [
      'Back flat against the wall, feet a step and a half out in front.',
      'Slide down until your thighs are parallel to the floor, and keep breathing calmly.',
      'People hold their breath without noticing: count your breaths under your breath.',
    ],
  },
  'alternating-lunges': {
    fr: [
      'Debout, pieds largeur de hanches, mains sur les hanches ou le long du corps.',
      'Un grand pas en avant, descends jusqu’à ce que les deux genoux fassent un angle droit, puis repousse.',
      'Le genou avant dépasse la pointe du pied : allonge le pas plutôt que de le raccourcir.',
    ],
    en: [
      'Standing, feet hip-width, hands on your hips or by your sides.',
      'A long step forward, drop until both knees make a right angle, then push back up.',
      'The front knee drifts past the toes: lengthen the step rather than shortening it.',
    ],
  },
  'jump-squat': {
    fr: [
      'Même position qu’un squat, bras libres pour accompagner le saut.',
      'Descends à mi-course, puis détends-toi vers le haut en poussant dans les talons.',
      'On atterrit jambes tendues : reçois sur l’avant du pied et enchaîne directement sur la descente suivante.',
    ],
    en: [
      'Same stance as a squat, arms free to swing with the jump.',
      'Drop halfway, then spring upwards by driving through your heels.',
      'People land on straight legs: land on the ball of your foot and let it flow into the next dip.',
    ],
  },
  'goblet-squat': {
    fr: [
      'Un haltère tenu verticalement contre la poitrine, les deux mains sous la tête haute.',
      'Descends entre tes genoux en gardant les coudes à l’intérieur, poitrine haute.',
      'Le poids tire vers l’avant : garde-le collé au sternum plutôt qu’à bout de bras.',
    ],
    en: [
      'One dumbbell held upright against your chest, both hands under the top head.',
      'Drop between your knees with your elbows inside them, chest up.',
      'The weight pulls you forward: keep it against your breastbone rather than away from you.',
    ],
  },
  'bulgarian-split-squat-with-dumbbells': {
    fr: [
      'Pied arrière posé sur une chaise, pied avant assez loin pour être à plat en bas.',
      'Descends droit vers le sol, le poids sur la jambe avant, un haltère dans chaque main.',
      'On pousse avec la jambe arrière : elle sert d’appui, c’est la jambe avant qui travaille.',
    ],
    en: [
      'Back foot on a chair, front foot far enough forward to stay flat at the bottom.',
      'Drop straight down, weight on the front leg, a dumbbell in each hand.',
      'People push with the back leg: it is only a support — the front leg does the work.',
    ],
  },
  'leg-press': {
    fr: [
      'Dos et bassin bien plaqués, pieds à mi-hauteur de la plateforme, largeur d’épaules.',
      'Descends jusqu’à un angle droit aux genoux, puis repousse sans verrouiller en haut.',
      'Le bassin décolle en bas : réduis l’amplitude plutôt que d’arrondir le bas du dos.',
    ],
    en: [
      'Back and hips flat against the pad, feet mid-platform, shoulder-width apart.',
      'Lower to a right angle at the knees, then press back without locking out at the top.',
      'The hips lift at the bottom: cut the range short rather than round your lower back.',
    ],
  },
  'barbell-back-squat': {
    fr: [
      'Barre posée sur le haut du dos, pas sur la nuque. Gainage serré avant de sortir des supports.',
      'Descends en gardant le regard droit devant, remonte en poussant le sol loin de toi.',
      'Le buste bascule vers l’avant : allège la barre et filme-toi de profil une série.',
    ],
    en: [
      'Bar resting on your upper back, never your neck. Brace hard before you step out of the rack.',
      'Descend with your eyes straight ahead, stand by pushing the floor away from you.',
      'The torso tips forward: take weight off and film one set from the side.',
    ],
  },
  'machine-leg-curl': {
    fr: [
      'Rouleau juste au-dessus des talons, bassin plaqué sur l’assise.',
      'Ramène les talons vers les fessiers, et retiens surtout la descente.',
      'On lâche le retour : la descente lente est l’essentiel du travail ici.',
    ],
    en: [
      'Roller just above your heels, hips pressed into the seat.',
      'Draw your heels towards your glutes, and above all control the way back down.',
      'People drop the return: the slow lowering is most of the work on this one.',
    ],
  },

  // Fessiers
  'glute-bridge': {
    fr: [
      'Allongé sur le dos, genoux pliés, talons à une longueur de main des fessiers.',
      'Pousse dans les talons et monte le bassin jusqu’à une ligne droite genoux-hanches-épaules.',
      'On cambre le bas du dos pour monter plus haut : serre les fessiers et arrête-toi à la ligne droite.',
    ],
    en: [
      'On your back, knees bent, heels a hand-length from your glutes.',
      'Drive through your heels and lift your hips to a straight line from knees to shoulders.',
      'People arch the lower back to go higher: squeeze your glutes and stop at the straight line.',
    ],
  },
  'floor-kickbacks': {
    fr: [
      'À quatre pattes, mains sous les épaules, genoux sous les hanches.',
      'Monte un talon vers le plafond en gardant le genou plié à angle droit.',
      'Le bas du dos se creuse : monte moins haut et garde le ventre engagé.',
    ],
    en: [
      'On all fours, hands under your shoulders, knees under your hips.',
      'Lift one heel towards the ceiling, keeping that knee bent at a right angle.',
      'The lower back dips: lift less high and keep your middle engaged.',
    ],
  },
  'single-leg-glute-bridge': {
    fr: [
      'Même installation que le pont, une jambe tendue vers le plafond.',
      'Monte le bassin avec la seule jambe au sol, sans laisser le bassin partir de travers.',
      'Une hanche descend plus bas que l’autre : repose la jambe libre si tu ne peux pas rester droit.',
    ],
    en: [
      'Set up like the bridge, one leg extended towards the ceiling.',
      'Lift with the grounded leg alone, without letting your hips tilt to one side.',
      'One hip drops lower than the other: put the free leg down if you cannot stay level.',
    ],
  },
  'romanian-deadlift-with-dumbbells': {
    fr: [
      'Debout, un haltère dans chaque main devant les cuisses, genoux à peine fléchis.',
      'Pousse les hanches vers l’arrière et laisse les haltères descendre le long des jambes.',
      'On plie les genoux comme pour un squat : le mouvement vient des hanches, pas des genoux.',
    ],
    en: [
      'Standing, a dumbbell in each hand in front of your thighs, knees barely bent.',
      'Push your hips back and let the dumbbells travel down along your legs.',
      'People bend the knees as in a squat: the movement comes from the hips, not the knees.',
    ],
  },
  'cable-kickback': {
    fr: [
      'Sangle à la cheville, face à la machine, mains sur le montant pour la stabilité.',
      'Envoie la jambe vers l’arrière en gardant le buste immobile, puis reviens lentement.',
      'C’est le buste qui bascule pour gagner de l’amplitude : réduis la charge.',
    ],
    en: [
      'Strap at your ankle, facing the machine, hands on the frame for balance.',
      'Drive the leg back with your torso still, then return slowly.',
      'The torso swings to buy range: take the weight down instead.',
    ],
  },
  'barbell-hip-thrust': {
    fr: [
      'Haut du dos calé sur un banc, barre sur le pli des hanches avec un coussin.',
      'Pousse dans les talons jusqu’à ce que les cuisses soient parallèles au sol, menton rentré.',
      'On termine en cambrant : la fin du mouvement est un verrouillage des fessiers, pas du dos.',
    ],
    en: [
      'Upper back against a bench, bar across your hip crease with a pad.',
      'Drive through your heels until your thighs are parallel to the floor, chin tucked.',
      'People finish by arching: the top of this is a glute squeeze, not a back bend.',
    ],
  },

  // Pectoraux
  'knee-push-ups': {
    fr: [
      'Genoux au sol, mains un peu plus larges que les épaules, corps aligné des genoux aux épaules.',
      'Descends la poitrine vers le sol en gardant les coudes à 45 degrés du buste.',
      'Les hanches tombent en premier : serre les fessiers pour que tout descende ensemble.',
    ],
    en: [
      'Knees down, hands slightly wider than your shoulders, body in line from knees to shoulders.',
      'Lower your chest towards the floor with your elbows about 45 degrees from your sides.',
      'The hips sag first: squeeze your glutes so the whole body goes down together.',
    ],
  },
  'push-ups': {
    fr: [
      'En planche, mains sous les épaules ou un peu plus larges, talons loin derrière.',
      'Descends jusqu’à frôler le sol de la poitrine, puis repousse en gardant la ligne.',
      'La tête part en avant avant le reste : c’est la poitrine qui touche en premier, pas le menton.',
    ],
    en: [
      'In a plank, hands under or slightly wider than your shoulders, heels far behind.',
      'Lower until your chest nearly touches the floor, then press back up keeping the line.',
      'The head leads the way down: your chest should arrive first, not your chin.',
    ],
  },
  'floor-press-with-dumbbells': {
    fr: [
      'Allongé sur le dos, genoux pliés, un haltère dans chaque main au niveau de la poitrine.',
      'Pousse vers le plafond, puis redescends jusqu’à ce que les triceps touchent le sol.',
      'On cogne le sol pour rebondir : laisse les coudes se poser, marque un temps, puis repousse.',
    ],
    en: [
      'On your back, knees bent, a dumbbell in each hand level with your chest.',
      'Press towards the ceiling, then lower until your triceps touch the floor.',
      'People bounce off the floor: let the elbows settle, pause, then press.',
    ],
  },
  'dumbbell-floor-fly': {
    fr: [
      'Allongé, bras tendus au-dessus de la poitrine, coudes très légèrement fléchis.',
      'Ouvre les bras en arc de cercle jusqu’au sol, puis referme sans tendre complètement.',
      'Les coudes se plient en cours de route : garde l’angle fixe, c’est ce qui distingue l’écarté du développé.',
    ],
    en: [
      'Lying down, arms extended over your chest, elbows very slightly bent.',
      'Open your arms in an arc to the floor, then close without locking out.',
      'The elbows bend on the way: keep that angle fixed — it is what makes this a fly, not a press.',
    ],
  },
  'machine-chest-fly': {
    fr: [
      'Dos plaqué, poignées à hauteur de poitrine, pieds bien posés au sol.',
      'Referme les bras devant toi, marque un temps, puis laisse revenir lentement.',
      'On laisse le poids claquer au retour : la phase de retour est la moitié de l’exercice.',
    ],
    en: [
      'Back flat, handles at chest height, feet planted.',
      'Bring your arms together in front of you, pause, then let them travel back slowly.',
      'People let the stack slam on the return: that half of the movement is half the exercise.',
    ],
  },
  'barbell-bench-press': {
    fr: [
      'Yeux sous la barre, pieds au sol, omoplates serrées l’une contre l’autre.',
      'Descends la barre au niveau du bas des pectoraux, puis repousse en ligne droite.',
      'Les coudes s’ouvrent à 90 degrés : garde-les à 45, c’est l’épaule qui paie le reste.',
    ],
    en: [
      'Eyes under the bar, feet on the floor, shoulder blades pulled together.',
      'Lower the bar to your lower chest, then press straight back up.',
      'The elbows flare to 90 degrees: keep them nearer 45 — your shoulders pay for the rest.',
    ],
  },

  // Dos
  'bird-dog': {
    fr: [
      'À quatre pattes, mains sous les épaules, dos plat comme une table.',
      'Tends le bras droit et la jambe gauche en même temps, puis change de côté sans précipitation.',
      'Le bassin bascule à chaque changement : imagine un verre d’eau posé sur le bas de ton dos.',
    ],
    en: [
      'On all fours, hands under your shoulders, back flat like a table.',
      'Extend your right arm and left leg together, then swap sides without rushing.',
      'The hips rock at every swap: picture a glass of water balanced on your lower back.',
    ],
  },
  'superman': {
    fr: [
      'À plat ventre, bras tendus devant, front posé au sol.',
      'Décolle bras, poitrine et cuisses de quelques centimètres, puis repose doucement.',
      'On monte le plus haut possible : quelques centimètres suffisent, le cou reste dans l’axe.',
    ],
    en: [
      'Face down, arms stretched out in front, forehead on the floor.',
      'Lift your arms, chest and thighs a few centimetres, then lower gently.',
      'People lift as high as they can: a few centimetres is enough, and the neck stays in line.',
    ],
  },
  'inverted-row-under-a-sturdy-table': {
    fr: [
      'Allongé sous une table solide, mains sur le bord, talons au sol, corps gainé.',
      'Tire ta poitrine vers le bord de la table en serrant les omoplates.',
      'Le bassin reste en arrière : le corps monte d’un bloc, des talons aux épaules.',
    ],
    en: [
      'Lying under a sturdy table, hands on the edge, heels down, body braced.',
      'Pull your chest towards the table edge, squeezing your shoulder blades.',
      'The hips lag behind: the whole body rises as one, heels to shoulders.',
    ],
  },
  'single-arm-dumbbell-row': {
    fr: [
      'Un genou et une main sur un banc, dos plat, haltère dans la main libre.',
      'Tire le coude vers la hanche en gardant le buste immobile, puis descends lentement.',
      'Le buste tourne pour tirer plus lourd : allège plutôt que de pivoter.',
    ],
    en: [
      'One knee and one hand on a bench, back flat, dumbbell in the free hand.',
      'Pull your elbow towards your hip with your torso still, then lower slowly.',
      'The torso twists to shift more weight: go lighter rather than rotating.',
    ],
  },
  'bent-over-dumbbell-row': {
    fr: [
      'Debout, buste penché à environ 45 degrés, genoux souples, dos plat.',
      'Tire les deux haltères vers le bas des côtes, coudes près du corps.',
      'Le dos s’arrondit quand ça devient dur : arrête la série, c’est la limite du jour.',
    ],
    en: [
      'Standing, torso hinged to about 45 degrees, knees soft, back flat.',
      'Pull both dumbbells towards your lower ribs, elbows close to your body.',
      'The back rounds when it gets hard: end the set there — that is the day\u2019s limit.',
    ],
  },
  'lat-pulldown': {
    fr: [
      'Cuisses bien calées sous les boudins, prise un peu plus large que les épaules.',
      'Tire la barre vers le haut de la poitrine en ouvrant le buste, puis remonte en contrôlant.',
      'On tire derrière la nuque : c’est devant, et seulement devant.',
    ],
    en: [
      'Thighs locked under the pads, grip a little wider than your shoulders.',
      'Pull the bar to your upper chest, opening your chest, then let it rise under control.',
      'People pull behind the neck: it goes in front, and only in front.',
    ],
  },
  'seated-cable-row': {
    fr: [
      'Assis, genoux légèrement fléchis, dos droit, poignée à deux mains.',
      'Tire vers le nombril en serrant les omoplates, puis laisse revenir sans t’affaisser.',
      'Le buste part loin en arrière : il reste vertical, ce sont les bras et le dos qui travaillent.',
    ],
    en: [
      'Seated, knees slightly bent, back upright, handle in both hands.',
      'Pull to your navel, squeezing your shoulder blades, then let it return without slumping.',
      'The torso rocks far back: keep it upright — the arms and back do the work.',
    ],
  },
  'assisted-pull-ups': {
    fr: [
      'Règle l’assistance pour pouvoir faire six à huit répétitions propres, pas une de plus.',
      'Monte jusqu’à ce que le menton dépasse la barre, descends bras presque tendus.',
      'On ne descend qu’à moitié : l’amplitude complète est ce qui fait progresser vers la traction libre.',
    ],
    en: [
      'Set the assistance so you can manage six to eight clean reps, no more.',
      'Pull until your chin clears the bar, lower until your arms are nearly straight.',
      'People only come halfway down: the full range is what builds towards an unassisted pull-up.',
    ],
  },
  'deadlift': {
    fr: [
      'Barre au-dessus du milieu du pied, mains juste en dehors des genoux, dos plat et poitrine haute.',
      'Pousse le sol avec les jambes, la barre reste collée contre toi jusqu’en haut.',
      'Les hanches montent avant la poitrine : tout monte ensemble, sinon le bas du dos prend tout.',
    ],
    en: [
      'Bar over mid-foot, hands just outside your knees, back flat and chest up.',
      'Push the floor away with your legs; the bar stays against you the whole way.',
      'The hips rise before the chest: everything comes up together, or your lower back takes it all.',
    ],
  },

  // Épaules
  'prone-y-raises': {
    fr: [
      'À plat ventre, bras tendus devant en forme de Y, pouces vers le plafond.',
      'Décolle les bras de quelques centimètres, marque un temps, repose.',
      'On hausse les épaules vers les oreilles : garde-les basses, loin des oreilles.',
    ],
    en: [
      'Face down, arms out in front in a Y, thumbs up.',
      'Lift your arms a few centimetres, hold briefly, lower.',
      'The shoulders creep towards the ears: keep them down and away.',
    ],
  },
  'pike-push-ups': {
    fr: [
      'En V renversé, fessiers hauts, mains largeur d’épaules, tête entre les bras.',
      'Descends le sommet du crâne vers le sol, puis repousse.',
      'Les hanches descendent avec : garde le V, sinon c’est une pompe classique.',
    ],
    en: [
      'In an upside-down V, hips high, hands shoulder-width, head between your arms.',
      'Lower the crown of your head towards the floor, then press back up.',
      'The hips drop too: hold the V, or it turns into an ordinary push-up.',
    ],
  },
  'dumbbell-lateral-raises': {
    fr: [
      'Debout, un haltère dans chaque main le long du corps, coudes à peine fléchis.',
      'Monte les bras sur les côtés jusqu’à hauteur d’épaules, pas plus haut.',
      'On s’aide d’un élan du buste : prends plus léger, c’est un exercice qui se fait lentement.',
    ],
    en: [
      'Standing, a dumbbell in each hand by your sides, elbows barely bent.',
      'Raise your arms out to the sides up to shoulder height, no higher.',
      'People swing the torso for momentum: go lighter — this one is done slowly.',
    ],
  },
  'dumbbell-rear-delt-fly': {
    fr: [
      'Buste penché vers l’avant, dos plat, haltères sous la poitrine.',
      'Ouvre les bras sur les côtés en serrant les omoplates, puis redescends lentement.',
      'Les coudes passent derrière les épaules : arrête-toi quand les bras sont alignés avec le buste.',
    ],
    en: [
      'Torso hinged forward, back flat, dumbbells hanging under your chest.',
      'Open your arms out to the sides, squeezing your shoulder blades, then lower slowly.',
      'The elbows travel behind the shoulders: stop when your arms line up with your torso.',
    ],
  },
  'dumbbell-overhead-press': {
    fr: [
      'Debout ou assis dos calé, haltères au niveau des oreilles, paumes vers l’avant.',
      'Pousse vers le plafond jusqu’à ce que les bras soient tendus, puis redescends aux oreilles.',
      'Le bas du dos se cambre pour aider : serre le ventre, ou fais-le assis avec un dossier.',
    ],
    en: [
      'Standing, or seated with back support, dumbbells at ear height, palms forward.',
      'Press towards the ceiling until your arms are straight, then lower back to your ears.',
      'The lower back arches to help: brace your middle, or do it seated against a backrest.',
    ],
  },
  'cable-face-pull': {
    fr: [
      'Poulie à hauteur de visage, corde à deux mains, bras tendus devant toi.',
      'Tire la corde vers le front en écartant les mains, coudes hauts.',
      'On tire comme un rameur, coudes bas : ici les coudes restent au-dessus des poignets.',
    ],
    en: [
      'Pulley at face height, rope in both hands, arms extended in front of you.',
      'Pull the rope towards your forehead, spreading your hands, elbows high.',
      'People row it with low elbows: here the elbows stay above the wrists.',
    ],
  },
  'machine-shoulder-press': {
    fr: [
      'Assis dos plaqué, poignées à hauteur d’épaules, pieds au sol.',
      'Pousse vers le haut sans verrouiller les coudes, puis redescends en contrôlant.',
      'On décolle le dos du dossier en fin de poussée : réduis la charge.',
    ],
    en: [
      'Seated with your back flat, handles at shoulder height, feet down.',
      'Press up without locking your elbows, then lower under control.',
      'The back comes off the pad at the top: take the weight down.',
    ],
  },

  // Biceps
  'isometric-towel-curl': {
    fr: [
      'Une serviette sous un pied, les deux extrémités dans les mains, coudes au corps.',
      'Tire vers le haut en résistant avec la jambe, et tiens la tension sans bouger.',
      'On retient son souffle : respire normalement pendant toute la tenue.',
    ],
    en: [
      'A towel under one foot, both ends in your hands, elbows at your sides.',
      'Pull upwards while the leg resists, and hold the tension without moving.',
      'People hold their breath: keep breathing normally throughout the hold.',
    ],
  },
  'dumbbell-biceps-curl': {
    fr: [
      'Debout, un haltère dans chaque main, paumes vers l’avant, coudes collés au buste.',
      'Monte les haltères vers les épaules sans bouger les coudes, puis redescends lentement.',
      'Les coudes avancent en fin de montée : s’ils bougent, c’est l’épaule qui prend le relais.',
    ],
    en: [
      'Standing, a dumbbell in each hand, palms forward, elbows pinned to your sides.',
      'Curl towards your shoulders without moving your elbows, then lower slowly.',
      'The elbows drift forward at the top: once they move, the shoulder takes over.',
    ],
  },
  'hammer-curl': {
    fr: [
      'Même position que la flexion classique, mais paumes face à face.',
      'Monte sans tourner les poignets, comme si tu tenais deux marteaux.',
      'On balance le buste d’avant en arrière : plante les pieds et garde le dos immobile.',
    ],
    en: [
      'Same stance as the ordinary curl, but palms facing each other.',
      'Curl without rotating your wrists, as if holding two hammers.',
      'People rock the torso back and forth: plant your feet and keep your back still.',
    ],
  },
  'cable-curl': {
    fr: [
      'Face à la poulie basse, barre ou poignée à deux mains, coudes au corps.',
      'Monte en contractant, marque un temps en haut, puis laisse redescendre en résistant.',
      'La poulie tire le buste vers l’avant : recule d’un pas pour garder la tension droite.',
    ],
    en: [
      'Facing the low pulley, bar or handle in both hands, elbows at your sides.',
      'Curl up, pause at the top, then resist on the way down.',
      'The cable pulls your torso forward: step back so the line of pull stays straight.',
    ],
  },

  // Triceps
  'close-grip-knee-push-ups': {
    fr: [
      'Genoux au sol, mains écartées de la largeur des épaules seulement.',
      'Descends en gardant les coudes serrés contre le buste, puis repousse.',
      'Les coudes s’écartent dès que ça devient dur : c’est ce qui transforme l’exercice en pompe classique.',
    ],
    en: [
      'Knees down, hands only shoulder-width apart.',
      'Lower with your elbows tucked against your sides, then press back up.',
      'The elbows flare as soon as it gets hard: that turns it back into an ordinary push-up.',
    ],
  },
  'chair-dips': {
    fr: [
      'Mains sur le bord d’une chaise stable, fessiers juste devant, jambes fléchies.',
      'Descends jusqu’à un angle droit aux coudes, puis repousse.',
      'On descend trop bas et l’épaule tire : arrête-toi à l’angle droit, pas plus.',
    ],
    en: [
      'Hands on the edge of a stable chair, hips just in front of it, legs bent.',
      'Lower to a right angle at the elbows, then press back up.',
      'People go too low and the shoulder complains: stop at the right angle, no further.',
    ],
  },
  'dumbbell-triceps-extension': {
    fr: [
      'Un haltère tenu à deux mains derrière la tête, coudes pointés vers le plafond.',
      'Tends les bras vers le haut sans bouger les coudes, puis redescends lentement.',
      'Les coudes s’ouvrent vers l’extérieur : garde-les serrés, parallèles l’un à l’autre.',
    ],
    en: [
      'One dumbbell held in both hands behind your head, elbows pointing at the ceiling.',
      'Straighten your arms upwards without moving your elbows, then lower slowly.',
      'The elbows splay outwards: keep them tucked and parallel.',
    ],
  },
  'cable-triceps-pushdown': {
    fr: [
      'Face à la poulie haute, coudes collés au buste, buste très légèrement penché.',
      'Pousse vers le bas jusqu’à tendre les bras, puis remonte en contrôlant.',
      'On s’aide du poids du corps en se penchant : garde le buste fixe, seuls les avant-bras bougent.',
    ],
    en: [
      'Facing the high pulley, elbows pinned to your sides, torso leaning very slightly.',
      'Push down until your arms are straight, then let it rise under control.',
      'People lean in to use bodyweight: keep the torso still — only the forearms move.',
    ],
  },

  // Abdos
  'plank': {
    fr: [
      'Avant-bras au sol sous les épaules, pieds écartés de la largeur des hanches.',
      'Aligne la tête, le bassin et les talons, et respire calmement.',
      'Les fessiers montent pour soulager : si la ligne se casse, arrête — une planche courte et droite vaut mieux.',
    ],
    en: [
      'Forearms on the floor under your shoulders, feet hip-width apart.',
      'Line up your head, hips and heels, and breathe calmly.',
      'The hips ride up to make it easier: when the line breaks, stop — a short straight plank is worth more.',
    ],
  },
  'side-plank': {
    fr: [
      'Sur le côté, coude sous l’épaule, pieds superposés ou décalés.',
      'Monte le bassin jusqu’à une ligne droite de la tête aux pieds, et tiens.',
      'Le bassin part vers l’arrière : garde les hanches empilées l’une au-dessus de l’autre.',
    ],
    en: [
      'On your side, elbow under your shoulder, feet stacked or staggered.',
      'Lift your hips to a straight line from head to feet, and hold.',
      'The hips drift backwards: keep them stacked one above the other.',
    ],
  },
  'dead-bug': {
    fr: [
      'Sur le dos, bras tendus vers le plafond, genoux au-dessus des hanches à angle droit.',
      'Descends un bras et la jambe opposée, puis reviens et change de côté.',
      'Le bas du dos décolle du sol : va moins loin, il doit rester plaqué tout du long.',
    ],
    en: [
      'On your back, arms towards the ceiling, knees over your hips at a right angle.',
      'Lower one arm and the opposite leg, then return and swap sides.',
      'The lower back lifts off the floor: go less far — it must stay flat the whole time.',
    ],
  },
  'crunches': {
    fr: [
      'Sur le dos, genoux pliés, mains croisées sur la poitrine ou effleurant les tempes.',
      'Décolle les épaules de quelques centimètres en soufflant, puis repose.',
      'On tire sur la nuque avec les mains : garde un espace d’un poing entre le menton et la poitrine.',
    ],
    en: [
      'On your back, knees bent, hands crossed on your chest or lightly at your temples.',
      'Lift your shoulders a few centimetres as you breathe out, then lower.',
      'People pull on their neck: keep a fist\u2019s gap between chin and chest.',
    ],
  },
  'mountain-climbers': {
    fr: [
      'En position de planche haute, mains sous les épaules, corps aligné.',
      'Ramène un genou vers la poitrine puis l’autre, à un rythme que tu peux tenir.',
      'Les fessiers montent à mesure que ça accélère : ralentis plutôt que de casser la ligne.',
    ],
    en: [
      'In a high plank, hands under your shoulders, body in line.',
      'Draw one knee towards your chest then the other, at a pace you can hold.',
      'The hips rise as the pace goes up: slow down rather than break the line.',
    ],
  },
  'lying-leg-raises': {
    fr: [
      'Sur le dos, mains sous les fessiers, jambes tendues.',
      'Monte les jambes jusqu’à la verticale, puis redescends sans toucher le sol.',
      'Le bas du dos se creuse en bas : plie un peu les genoux ou réduis l’amplitude.',
    ],
    en: [
      'On your back, hands under your glutes, legs straight.',
      'Raise your legs to vertical, then lower without touching the floor.',
      'The lower back arches at the bottom: bend your knees a little or cut the range short.',
    ],
  },

  // Cardio
  'brisk-march-on-the-spot': {
    fr: [
      'Debout, assez de place pour lever les genoux sans rien heurter.',
      'Monte les genoux à mi-hauteur et fais travailler les bras, sans impact.',
      'On regarde ses pieds : garde le regard devant, le buste reste droit.',
    ],
    en: [
      'Standing, with enough room to lift your knees without hitting anything.',
      'Bring your knees halfway up and work your arms, with no impact.',
      'People watch their feet: keep your eyes ahead and your torso upright.',
    ],
  },
  'jumping-jacks': {
    fr: [
      'Debout, pieds joints, bras le long du corps.',
      'Écarte les pieds et monte les bras en même temps, puis reviens, à rythme régulier.',
      'On atterrit lourdement sur les talons : reçois sur l’avant du pied, genoux souples.',
    ],
    en: [
      'Standing, feet together, arms by your sides.',
      'Jump your feet apart and raise your arms together, then back, at a steady rhythm.',
      'People land heavily on their heels: land on the balls of your feet, knees soft.',
    ],
  },
  'high-knees': {
    fr: [
      'Debout, sur l’avant des pieds, bras fléchis prêts à accompagner.',
      'Monte alternativement les genoux à hauteur de hanches, le plus régulièrement possible.',
      'Le buste part en arrière pour monter plus haut : garde-le vertical, quitte à monter moins.',
    ],
    en: [
      'Standing on the balls of your feet, arms bent and ready to swing.',
      'Drive your knees alternately to hip height, as evenly as you can.',
      'The torso leans back to get the knees higher: keep it upright, even if they come up less.',
    ],
  },
  'burpees': {
    fr: [
      'Debout, de la place devant toi pour poser les mains au sol.',
      'Mains au sol, jambes en arrière, remonte, puis redresse-toi — enchaîne sans te presser.',
      'On s’effondre en planche : pose les pieds plutôt que de les jeter, le dos reste gainé.',
    ],
    en: [
      'Standing, with room in front to put your hands on the floor.',
      'Hands down, legs back, bring them in, stand up — string them together without rushing.',
      'People collapse into the plank: place your feet rather than throwing them, back braced.',
    ],
  },
  'indoor-bike-or-rower': {
    fr: [
      'Règle la hauteur avant de commencer : jambe presque tendue en bas de la course.',
      'Tiens une allure où tu pourrais encore tenir une conversation.',
      'On part trop vite et on s’éteint à mi-parcours : la régularité vaut mieux que la pointe.',
    ],
    en: [
      'Set the height before you start: leg nearly straight at the bottom of the stroke.',
      'Hold a pace at which you could still hold a conversation.',
      'People go out too fast and fade halfway: steady beats a burst.',
    ],
  },
};

/** The cues for one exercise, in the language this build speaks. */
export function cuesFor(slug: string): ExerciseCue | null {
  const entry = CUES[slug];
  if (!entry) return null;
  const [setup, execute, mistake] = lang === 'fr' ? entry.fr : entry.en;
  return { setup, execute, mistake };
}

/** Every slug this file words, so a test can hold it against the catalogue. */
export const SLUGS_WITH_CUES = Object.keys(CUES);

/** Both languages of one entry, for the test that keeps them the same shape. */
export function bothLanguages(slug: string): { fr: Cue; en: Cue } | null {
  return CUES[slug] ?? null;
}
