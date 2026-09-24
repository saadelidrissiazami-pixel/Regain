// “In public” sessions, narrated.
//
// Written to be followed with the eyes open and without drawing attention: on a train, in a
// waiting room, in a queue, in an open-plan office. This is the theme where running on its own
// matters most — tapping your screen every twenty seconds on a packed train is exactly what we
// are trying to avoid.
//
// None of them asks you to close your eyes, or to breathe in any particular way. The attention
// goes outwards, never towards exploring what you feel.
//
// “Letting go of being watched” keeps its interactive format: it measures the discomfort before
// and after, and that comparison is the whole point of it.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** Quick grounding — 1 minute, 60 s. */
export const ancrageRapide: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Without changing how you are sitting or standing, feel your feet, or wherever your body meets what is holding it.',
      speakSeconds: 12,
      silenceSeconds: 8,
    },
    {
      text: 'One breath, a normal one. Do not force it.',
      speakSeconds: 10,
      silenceSeconds: 15,
    },
    {
      text: 'That is enough. You can go back to what you were doing.',
      speakSeconds: 10,
      silenceSeconds: 5,
    },
  ],
};

/** The two-minute emergency kit — 2 minutes, 120 s. */
export const kitDurgence: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Two minutes, wherever you are. Put your feet on the floor and find three objects around you.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'Three breaths: in gently, add a tiny second breath in on top, then a long breath out.',
      speakSeconds: 14,
      silenceSeconds: 16,
    },
    {
      text: 'Tell yourself: I do not have to solve all of this now.',
      speakSeconds: 12,
      silenceSeconds: 18,
    },
    {
      text: 'What is your next small action? Do only that one.',
      speakSeconds: 14,
      silenceSeconds: 16,
    },
  ],
};

/** The three-minute outing — 3 minutes, 180 s. */
export const sortieDeTroisMinutes: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'You can feel yourself saturating. Do not leave straight away: stop for a few seconds and put your feet on the floor.',
      speakSeconds: 18,
      silenceSeconds: 12,
    },
    {
      text: 'Three slow breaths.',
      speakSeconds: 10,
      silenceSeconds: 10,
    },
    {
      text: 'If you can, get somewhere quieter: a corridor, outside, a bench, a less busy corner.',
      speakSeconds: 12,
      silenceSeconds: 13,
    },
    {
      text: 'Now two minutes with no phone. Find five things you can see, four you can hear, three you can feel in your body.',
      speakSeconds: 14,
      silenceSeconds: 66,
    },
    {
      text: 'Do you want to go back now, or take a few more minutes? Decide calmly. Either is fine.',
      speakSeconds: 15,
      silenceSeconds: 10,
    },
  ],
};

/** Observer mode — 4 minutes, 240 s. */
export const modeObservateur: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Without moving from where you are: you are not obliged to take part in everything happening here. You can go back to simply observing for a while.',
      speakSeconds: 20,
      silenceSeconds: 15,
    },
    {
      text: 'Look for three colours around you.',
      speakSeconds: 10,
      silenceSeconds: 30,
    },
    {
      text: 'Three shapes.',
      speakSeconds: 8,
      silenceSeconds: 32,
    },
    {
      text: 'Three sounds.',
      speakSeconds: 8,
      silenceSeconds: 32,
    },
    {
      text: 'And three sensations: your feet on the floor, your back against the seat, the air on your face.',
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: 'I do not need to control the room. I can simply be in it.',
      speakSeconds: 15,
      silenceSeconds: 25,
    },
  ],
};

/** The pause button — 4 minutes, 240 s. */
export const boutonPause: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Say it to yourself, in your head: pause.',
      speakSeconds: 8,
      silenceSeconds: 12,
    },
    {
      text: 'Press your feet lightly into the floor. Feel the contact.',
      speakSeconds: 12,
      silenceSeconds: 23,
    },
    {
      text: 'Three breaths: gently in, slowly out. Forcing nothing.',
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: 'Choose a short sentence, for yourself alone. “I am here.” Or: “I have nothing to prove.”',
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: 'Do not think about the whole situation at once. Ask only this: what is the next small thing I have to do?',
      speakSeconds: 18,
      silenceSeconds: 32,
    },
    {
      text: 'Do only that one. Then the next, one at a time.',
      speakSeconds: 15,
      silenceSeconds: 30,
    },
  ],
};

/** Breathing in a crowd — 4 minutes, 240 s. */
export const respirerDansLaFoule: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'This journey can feel long, surrounded by people. You have nothing to perform here.',
      speakSeconds: 16,
      silenceSeconds: 19,
    },
    {
      text: 'Choose one fixed point to rest your eyes on. Not to examine it: just to rest them.',
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: 'Count four breaths. Do not change how you breathe, only count.',
      speakSeconds: 12,
      silenceSeconds: 33,
    },
    {
      text: 'Notice that nobody is staring at you. Everyone is caught up in their own journey, their own thoughts.',
      speakSeconds: 16,
      silenceSeconds: 24,
    },
    {
      text: 'Your shoulders can come down a little. Your jaw can unclench.',
      speakSeconds: 12,
      silenceSeconds: 28,
    },
    {
      text: 'The journey moves at its own pace whether you are tense or not. You may as well be a little less so.',
      speakSeconds: 15,
      silenceSeconds: 25,
    },
  ],
};

/**
 * Letting go of being watched — the interactive format is kept.
 * It measures the discomfort before and after, and that number is what it offers over the others:
 * you leave with evidence rather than an impression.
 */
export const detachementRegardAutres: ProgramContent = {
  type: 'grounding',
  steps: [
    { kind: 'text', text: 'You are surrounded by people. This moment is as much yours as anybody else’s here.' },
    {
      kind: 'scale',
      prompt: 'Right now: how watched or uncomfortable do you feel?',
      key: 'before',
    },
    {
      kind: 'text',
      text: 'Without closing your eyes, rest your gaze on something neutral — a window, the floor, a fixed point.',
    },
    { kind: 'confirm', text: 'Take the time to find one.', buttonLabel: 'I have found my point' },
    {
      kind: 'text',
      text: 'Most of the people around you are caught up in their own thoughts, not in yours. We are rarely as watched as we believe.',
    },
    {
      kind: 'breath-counter',
      text: 'Breathe normally, forcing nothing. Tap with each breath.',
      count: 3,
    },
    { kind: 'text', text: 'Feel your feet on the floor, or your body resting on the seat. One simple anchor, always there.' },
    { kind: 'text', text: 'You have nothing to prove here. Only to be here, until the next step.' },
    {
      kind: 'scale',
      prompt: 'And now: where are you?',
      key: 'after',
    },
  ],
};
