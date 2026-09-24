import type { Equipment, ExperienceLevel } from './options';

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
  { name: 'Bodyweight squat', group: 'jambes', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Feet shoulder-width apart, chest up: go down as if sitting onto a chair.' },
  { name: 'Wall sit', group: 'jambes', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Back flat against the wall, thighs parallel to the floor, breathe calmly.', timed: '30-45 s' },
  { name: 'Alternating lunges', group: 'jambes', equipment: 'poids_du_corps', minLevel: 'debutant', stress: ['genou'], tip: 'Front knee stays over the ankle, torso upright.' },
  { name: 'Jump squat', group: 'jambes', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['genou'], tip: 'Land softly on the ball of the foot, knees tracking straight.' },
  { name: 'Goblet squat', group: 'jambes', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: 'Hold the dumbbell against your chest, elbows between your knees at the bottom.' },
  { name: 'Bulgarian split squat with dumbbells', group: 'jambes', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['genou'], tip: 'Back foot on a chair, drop straight down.' },
  { name: 'Leg press', group: 'jambes', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Do not lock the knees out at the top of the push.' },
  { name: 'Barbell back squat', group: 'jambes', equipment: 'salle', minLevel: 'intermediaire', stress: ['dos', 'genou'], tip: 'Brace hard, bar on the upper back, eyes straight ahead.' },
  { name: 'Machine leg curl', group: 'jambes', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Move slowly, especially on the way down.' },

  // Glutes
  { name: 'Glute bridge', group: 'fessiers', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Squeeze the glutes at the top without arching the lower back.' },
  { name: 'Floor kickbacks', group: 'fessiers', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'On all fours, press the heel towards the ceiling without turning the hips.' },
  { name: 'Single-leg glute bridge', group: 'fessiers', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: [], tip: 'Keep the hips level and push through the heel on the floor.' },
  { name: 'Romanian deadlift with dumbbells', group: 'fessiers', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['dos'], tip: 'Flat back, hips travelling backwards, dumbbells grazing the thighs.' },
  { name: 'Cable kickback', group: 'fessiers', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Steady torso, controlled range.' },
  { name: 'Barbell hip thrust', group: 'fessiers', equipment: 'salle', minLevel: 'intermediaire', stress: [], tip: 'Upper back on the bench, chin tucked, lock the glutes out at the top.' },

  // Chest
  { name: 'Knee push-ups', group: 'pectoraux', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Body in a line from knees to shoulders, elbows at 45°.' },
  { name: 'Push-ups', group: 'pectoraux', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: [], tip: 'Brace hard, chest down until it grazes the floor.' },
  { name: 'Floor press with dumbbells', group: 'pectoraux', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: 'Lying down, let the elbows touch the floor gently, then press to the ceiling.' },
  { name: 'Dumbbell floor fly', group: 'pectoraux', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['epaule'], tip: 'Arms slightly bent, open slowly and do not force the bottom position.' },
  { name: 'Machine chest fly', group: 'pectoraux', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Shoulders down, squeeze the chest at the centre.' },
  { name: 'Barbell bench press', group: 'pectoraux', equipment: 'salle', minLevel: 'intermediaire', stress: ['epaule'], tip: 'Shoulder blades pinched, feet planted, bar under control.' },

  // Back
  { name: 'Bird dog', group: 'dos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'On all fours, extend opposite arm and leg without moving the hips.' },
  { name: 'Superman', group: 'dos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: ['dos'], tip: 'Face down, lift arms and legs gently, eyes on the floor.' },
  { name: 'Inverted row under a sturdy table', group: 'dos', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: [], tip: 'Body braced, pull your chest towards the edge of the table.' },
  { name: 'Single-arm dumbbell row', group: 'dos', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: 'Hand and knee supported, pull the elbow towards the hip.' },
  { name: 'Bent-over dumbbell row', group: 'dos', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['dos'], tip: 'Flat back, torso hinged, squeeze the shoulder blades at the top.' },
  { name: 'Lat pulldown', group: 'dos', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Pull the bar to the top of the chest without swinging.' },
  { name: 'Seated cable row', group: 'dos', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Torso upright, draw the elbows in along the body.' },
  { name: 'Assisted pull-ups', group: 'dos', equipment: 'salle', minLevel: 'intermediaire', stress: ['epaule'], tip: 'Chin over the bar, lower slowly.' },
  { name: 'Deadlift', group: 'dos', equipment: 'salle', minLevel: 'confirme', stress: ['dos'], tip: 'Bar against the shins, neutral back, push the floor away with your legs.' },

  // Shoulders
  { name: 'Prone Y raises', group: 'epaules', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Face down, arms in a Y, lift them by squeezing the shoulder blades.' },
  { name: 'Pike push-ups', group: 'epaules', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['epaule'], tip: 'Hips high, lower your head between your hands.' },
  { name: 'Dumbbell lateral raises', group: 'epaules', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: 'Up to shoulder height, light and controlled.' },
  { name: 'Dumbbell rear delt fly', group: 'epaules', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: 'Torso hinged, open the arms out to the sides, elbows slightly bent.' },
  { name: 'Dumbbell overhead press', group: 'epaules', equipment: 'halteres_maison', minLevel: 'intermediaire', stress: ['epaule'], tip: 'Seated, back straight, press overhead without arching.' },
  { name: 'Cable face pull', group: 'epaules', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Pull the rope towards your face, elbows high.' },
  { name: 'Machine shoulder press', group: 'epaules', equipment: 'salle', minLevel: 'debutant', stress: ['epaule'], tip: 'Back against the pad, comfortable range only.' },

  // Biceps
  { name: 'Isometric towel curl', group: 'biceps', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Foot on the towel, pull upwards and hold the tension.', timed: '20-30 s' },
  { name: 'Dumbbell biceps curl', group: 'biceps', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: 'Elbows pinned to your sides, no swinging.' },
  { name: 'Hammer curl', group: 'biceps', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: 'Thumbs up, controlled on the way up and down.' },
  { name: 'Cable curl', group: 'biceps', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Constant tension, neutral wrists.' },

  // Triceps
  { name: 'Close-grip knee push-ups', group: 'triceps', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Hands under the shoulders, elbows brushing the ribs.' },
  { name: 'Chair dips', group: 'triceps', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['epaule'], tip: 'Steady chair, do not go past 90° at the elbows.' },
  { name: 'Dumbbell triceps extension', group: 'triceps', equipment: 'halteres_maison', minLevel: 'debutant', stress: [], tip: 'Elbows fixed and tucked, only the forearm moves.' },
  { name: 'Cable triceps pushdown', group: 'triceps', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'Elbows against your sides, lock out at the bottom.' },

  // Core
  { name: 'Plank', group: 'abdos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Body in a line, glutes squeezed, breathe normally.', timed: '30-45 s' },
  { name: 'Side plank', group: 'abdos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Hip high, shoulder stacked over the elbow.', timed: '20-30 s per side' },
  { name: 'Dead bug', group: 'abdos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Lower back flat on the floor, opposite arm and leg extend.' },
  { name: 'Crunches', group: 'abdos', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Curl the torso up without pulling on your neck.' },
  { name: 'Mountain climbers', group: 'abdos', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: [], tip: 'Hips steady, knees driving towards the chest in turn.' },
  { name: 'Lying leg raises', group: 'abdos', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['dos'], tip: 'Hands under your glutes, back pressed into the floor.' },

  // Cardio
  { name: 'Brisk march on the spot', group: 'cardio', equipment: 'poids_du_corps', minLevel: 'debutant', stress: [], tip: 'Knees halfway up, arms working, no impact.' },
  { name: 'Jumping jacks', group: 'cardio', equipment: 'poids_du_corps', minLevel: 'debutant', stress: ['genou'], tip: 'Land softly, keep an even rhythm.' },
  { name: 'High knees', group: 'cardio', equipment: 'poids_du_corps', minLevel: 'debutant', stress: ['genou'], tip: 'On the balls of your feet, knees to hip height.' },
  { name: 'Burpees', group: 'cardio', equipment: 'poids_du_corps', minLevel: 'intermediaire', stress: ['genou', 'dos'], tip: 'String them together without rushing, keep the back braced.' },
  { name: 'Indoor bike or rower', group: 'cardio', equipment: 'salle', minLevel: 'debutant', stress: [], tip: 'A steady pace where you could still hold a conversation.', timed: '8-10 min' },
];
