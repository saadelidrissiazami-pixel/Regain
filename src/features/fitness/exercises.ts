import type { ImageKey } from '../../theme/imageKeys';
import type { Equipment, ExperienceLevel } from './options';
import { t } from '../../lib/i18n';

export type MuscleGroup =
  | 'jambes'
  | 'fessiers'
  | 'pectoraux'
  | 'dos'
  | 'epaules'
  | 'biceps'
  | 'triceps'
  | 'abdos'
  | 'cardio';

/** A joint under real load: the exercise is dropped if the person reports trouble there. */
export type JointStress = 'genou' | 'dos' | 'epaule';

export type ExerciseDef = {
  name: string;
  group: MuscleGroup;
  /** Minimum equipment: a bodyweight exercise works at home as well as in a gym. */
  equipment: Equipment;
  minLevel: ExperienceLevel;
  stress: JointStress[];
  tip: string;
  /** Held for time rather than counted in reps. */
  timed?: string;
};

export const EXERCISES: ExerciseDef[] = [
  // Legs
  { name: t('Bodyweight squat'), group: 'jambes', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: t('Feet shoulder-width apart, chest up: go down as if sitting onto a chair.') },
  { name: t('Wall sit'), group: 'jambes', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: t('Back flat against the wall, thighs parallel to the floor, breathe calmly.'), timed: '30-45 s' },
  { name: t('Alternating lunges'), group: 'jambes', equipment: 'poids_du_corps', minLevel: 'debutant', stress: ['genou'], tip: t('Front knee stays over the ankle, torso upright.') },
  { name: t('Jump squat'), group: 'jambes', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['genou'], tip: t('Land softly on the ball of the foot, knees tracking straight.') },
  { name: 'Goblet squat', group: 'jambes', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: t('Hold the dumbbell against your chest, elbows between your knees at the bottom.') },
  { name: t('Bulgarian split squat with dumbbells'), group: 'jambes', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['genou'], tip: t('Back foot on a chair, drop straight down.') },
  { name: t('Leg press'), group: 'jambes', equipment: 'salle', minLevel: 'debutant', stress: [], tip: t('Do not lock the knees out at the top of the push.') },
  { name: t('Barbell back squat'), group: 'jambes', equipment: 'salle', minLevel: 'intermediaire', stress: ['dos', 'genou'], tip: t('Brace hard, bar on the upper back, eyes straight ahead.') },
  { name: t('Machine leg curl'), group: 'jambes', equipment: 'salle', minLevel: 'debutant', stress: [], tip: t('Move slowly, especially on the way down.') },

  // Glutes
  { name: t('Glute bridge'), group: 'fessiers', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: t('Squeeze the glutes at the top without arching the lower back.') },
  { name: t('Floor kickbacks'), group: 'fessiers', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: t('On all fours, press the heel towards the ceiling without turning the hips.') },
  { name: t('Single-leg glute bridge'), group: 'fessiers', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: [], tip: t('Keep the hips level and push through the heel on the floor.') },
  { name: t('Romanian deadlift with dumbbells'), group: 'fessiers', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['dos'], tip: t('Flat back, hips travelling backwards, dumbbells grazing the thighs.') },
  { name: t('Cable kickback'), group: 'fessiers', equipment: 'salle', minLevel: 'debutant', stress: [], tip: t('Steady torso, controlled range.') },
  { name: t('Barbell hip thrust'), group: 'fessiers', equipment: 'salle', minLevel: 'intermediaire', stress: [], tip: t('Upper back on the bench, chin tucked, lock the glutes out at the top.') },

  // Chest
  { name: t('Knee push-ups'), group: 'pectoraux', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: t('Body in a line from knees to shoulders, elbows at 45°.') },
  { name: t('Push-ups'), group: 'pectoraux', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: [], tip: t('Brace hard, chest down until it grazes the floor.') },
  { name: t('Floor press with dumbbells'), group: 'pectoraux', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: t('Lying down, let the elbows touch the floor gently, then press to the ceiling.') },
  { name: t('Dumbbell floor fly'), group: 'pectoraux', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['epaule'], tip: t('Arms slightly bent, open slowly and do not force the bottom position.') },
  { name: t('Machine chest fly'), group: 'pectoraux', equipment: 'salle', minLevel: 'debutant', stress: [], tip: t('Shoulders down, squeeze the chest at the centre.') },
  { name: t('Barbell bench press'), group: 'pectoraux', equipment: 'salle', minLevel: 'intermediaire', stress: ['epaule'], tip: t('Shoulder blades pinched, feet planted, bar under control.') },

  // Back
  { name: 'Bird dog', group: 'dos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: t('On all fours, extend opposite arm and leg without moving the hips.') },
  { name: 'Superman', group: 'dos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: ['dos'], tip: t('Face down, lift arms and legs gently, eyes on the floor.') },
  { name: t('Inverted row under a sturdy table'), group: 'dos', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: [], tip: t('Body braced, pull your chest towards the edge of the table.') },
  { name: t('Single-arm dumbbell row'), group: 'dos', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: t('Hand and knee supported, pull the elbow towards the hip.') },
  { name: t('Bent-over dumbbell row'), group: 'dos', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['dos'], tip: t('Flat back, torso hinged, squeeze the shoulder blades at the top.') },
  { name: t('Lat pulldown'), group: 'dos', equipment: 'salle', minLevel: 'debutant', stress: [], tip: t('Pull the bar to the top of the chest without swinging.') },
  { name: t('Seated cable row'), group: 'dos', equipment: 'salle', minLevel: 'debutant', stress: [], tip: t('Torso upright, draw the elbows in along the body.') },
  { name: t('Assisted pull-ups'), group: 'dos', equipment: 'salle', minLevel: 'intermediaire', stress: ['epaule'], tip: t('Chin over the bar, lower slowly.') },
  { name: t('Deadlift'), group: 'dos', equipment: 'salle', minLevel: 'confirme', stress: ['dos'], tip: t('Bar against the shins, neutral back, push the floor away with your legs.') },

  // Shoulders
  { name: t('Prone Y raises'), group: 'epaules', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: t('Face down, arms in a Y, lift them by squeezing the shoulder blades.') },
  { name: t('Pike push-ups'), group: 'epaules', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['epaule'], tip: t('Hips high, lower your head between your hands.') },
  { name: t('Dumbbell lateral raises'), group: 'epaules', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: t('Up to shoulder height, light and controlled.') },
  { name: t('Dumbbell rear delt fly'), group: 'epaules', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: t('Torso hinged, open the arms out to the sides, elbows slightly bent.') },
  { name: t('Dumbbell overhead press'), group: 'epaules', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['epaule'], tip: t('Seated, back straight, press overhead without arching.') },
  { name: t('Cable face pull'), group: 'epaules', equipment: 'salle', minLevel: 'debutant', stress: [], tip: t('Pull the rope towards your face, elbows high.') },
  { name: t('Machine shoulder press'), group: 'epaules', equipment: 'salle', minLevel: 'debutant', stress: ['epaule'], tip: t('Back against the pad, comfortable range only.') },

  // Biceps
  { name: t('Isometric towel curl'), group: 'biceps', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: t('Foot on the towel, pull upwards and hold the tension.'), timed: '20-30 s' },
  { name: t('Dumbbell biceps curl'), group: 'biceps', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: t('Elbows pinned to your sides, no swinging.') },
  { name: t('Hammer curl'), group: 'biceps', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: t('Thumbs up, controlled on the way up and down.') },
  { name: t('Cable curl'), group: 'biceps', equipment: 'salle', minLevel: 'debutant', stress: [], tip: t('Constant tension, neutral wrists.') },

  // Triceps
  { name: t('Close-grip knee push-ups'), group: 'triceps', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: t('Hands under the shoulders, elbows brushing the ribs.') },
  { name: t('Chair dips'), group: 'triceps', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['epaule'], tip: t('Steady chair, do not go past 90° at the elbows.') },
  { name: t('Dumbbell triceps extension'), group: 'triceps', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: t('Elbows fixed and tucked, only the forearm moves.') },
  { name: t('Cable triceps pushdown'), group: 'triceps', equipment: 'salle', minLevel: 'debutant', stress: [], tip: t('Elbows against your sides, lock out at the bottom.') },

  // Core
  { name: t('Plank'), group: 'abdos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: t('Body in a line, glutes squeezed, breathe normally.'), timed: '30-45 s' },
  { name: t('Side plank'), group: 'abdos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: t('Hip high, shoulder stacked over the elbow.'), timed: t('20-30 s per side') },
  { name: 'Dead bug', group: 'abdos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: t('Lower back flat on the floor, opposite arm and leg extend.') },
  { name: t('Crunches'), group: 'abdos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: t('Curl the torso up without pulling on your neck.') },
  { name: 'Mountain climbers', group: 'abdos', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: [], tip: t('Hips steady, knees driving towards the chest in turn.') },
  { name: t('Lying leg raises'), group: 'abdos', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['dos'], tip: t('Hands under your glutes, back pressed into the floor.') },

  // Cardio
  { name: t('Brisk march on the spot'), group: 'cardio', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: t('Knees halfway up, arms working, no impact.') },
  { name: 'Jumping jacks', group: 'cardio', equipment: 'poids_du_corps', minLevel: 'debutant', stress: ['genou'], tip: t('Land softly, keep an even rhythm.') },
  { name: t('High knees'), group: 'cardio', equipment: 'poids_du_corps', minLevel: 'debutant', stress: ['genou'], tip: t('On the balls of your feet, knees to hip height.') },
  { name: 'Burpees', group: 'cardio', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['genou', 'dos'], tip: t('String them together without rushing, keep the back braced.') },
  { name: t('Indoor bike or rower'), group: 'cardio', equipment: 'salle', minLevel: 'debutant', stress: [], tip: t('A steady pace where you could still hold a conversation.'), timed: '8-10 min' },
];

/**
 * The muscle group an exercise belongs to, found from the name the plan stored.
 *
 * The plan keeps only the name, and that name was translated when the plan was generated. So a
 * plan built in French will not match a catalogue rendered in English, and this returns null
 * rather than the wrong group — the caller falls back to the session's own image.
 */
export function muscleGroupOf(name: string): MuscleGroup | null {
  const wanted = name.trim().toLowerCase();
  // The stored name is also tried through t(): the catalogue's keys are the English names, so a
  // plan generated in English still matches a catalogue rendered in French. The reverse (a French
  // plan read in English) has no key to look up and still falls back to the session image.
  const translated = t(name).trim().toLowerCase();
  return (
    EXERCISES.find((exercise) => {
      const own = exercise.name.trim().toLowerCase();
      return own === wanted || own === translated;
    })?.group ?? null
  );
}

/**
 * One photograph per muscle group, not per exercise.
 *
 * There are 56 exercises and no photograph of any of them. Rather than leaving every row blank,
 * or putting one picture on all of them, an exercise shows the group it trains: a squat and a
 * lunge share the legs image, a row and a curl share the pulling one. It illustrates honestly
 * without claiming to show that particular movement.
 *
 * It lives here rather than beside the images because this module loads no assets, which keeps
 * the mapping testable.
 */
export const IMAGE_KEY_BY_MUSCLE_GROUP: Record<MuscleGroup, ImageKey> = {
  jambes: 'fitLegs',
  fessiers: 'fitLegs',
  pectoraux: 'fitPush',
  epaules: 'fitPush',
  triceps: 'fitPush',
  dos: 'fitPull',
  biceps: 'fitPull',
  abdos: 'fitCore',
  cardio: 'sport',
};
