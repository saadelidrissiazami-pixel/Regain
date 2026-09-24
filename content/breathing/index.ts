// Breathing sessions.
//
// The heart of these — the ring that swells and shrinks with each phase — already ran on its own.
// What did not run on its own was the introduction: you had to tap “Next” two or three times
// before anything started, and tap again at the end. So the intros and the outros became timed
// blocks, like the narrated sessions.
//
// The durations are set so the total — intro plus cycles plus outro — matches what the catalogue
// claims, which tests/catalogue.test.ts checks.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** Quick breathing — 1 minute: 20 s of intro, 30 s of cycles, 10 s of outro. */
export const respirationExpress: ProgramContent = {
  type: 'breathing',
  intro: [
    {
      text: 'Three breaths, no more. Let your shoulders go and let your breathing settle.',
      speakSeconds: 12,
      silenceSeconds: 8,
    },
  ],
  cycles: 3,
  phases: [
    { label: 'Breathe in deeply through your nose', seconds: 4 },
    { label: 'Breathe out slowly through your mouth', seconds: 6 },
  ],
  outro: [{ text: 'That is already it.', speakSeconds: 6, silenceSeconds: 4 }],
};

/** 4-7-8 breathing — 2 minutes: 30 s of intro, 76 s of cycles, 14 s of outro. */
export const respiration478: ProgramContent = {
  type: 'breathing',
  intro: [
    {
      text: 'Four rounds: in for four seconds, hold for seven, out for eight. If holding bothers you, shorten the hold — there is nothing to get right here.',
      speakSeconds: 18,
      silenceSeconds: 12,
    },
  ],
  cycles: 4,
  phases: [
    { label: 'Breathe in through your nose', seconds: 4 },
    { label: 'Hold your breath', seconds: 7 },
    { label: 'Breathe out slowly through your mouth', seconds: 8 },
  ],
  outro: [{ text: 'Let your breathing find its own rhythm again.', speakSeconds: 8, silenceSeconds: 6 }],
};

/**
 * Coherent breathing — exactly 5 minutes.
 * Six breaths a minute for five minutes is the protocol; no intro and no outro are added, since
 * they would shift the duration without adding anything to instructions this simple.
 */
export const coherenceCardiaque: ProgramContent = {
  type: 'breathing',
  cycles: 30,
  phases: [
    { label: 'Breathe in', seconds: 5 },
    { label: 'Breathe out', seconds: 5 },
  ],
};

/** 4-6 breathing — 4 minutes: 75 s of intro, 120 s of cycles, 45 s of outro. */
export const respiration46: ProgramContent = {
  type: 'breathing',
  intro: [
    {
      text: 'Sit down, or stay standing. Let your shoulders go. You can keep your eyes open.',
      speakSeconds: 20,
      silenceSeconds: 5,
    },
    {
      text: 'First, change nothing. Watch the air coming in, the air going out, the movement of your stomach.',
      speakSeconds: 16,
      silenceSeconds: 9,
    },
    {
      text: 'Now a slower rhythm: four seconds in, six seconds out. It is the out-breath that lengthens, not the in-breath that forces.',
      speakSeconds: 18,
      silenceSeconds: 7,
    },
  ],
  cycles: 12,
  phases: [
    { label: 'Breathe in gently through your nose', seconds: 4 },
    { label: 'Breathe out slowly, letting go', seconds: 6 },
  ],
  outro: [
    { text: 'Breathe normally for a few more seconds.', speakSeconds: 12, silenceSeconds: 11 },
    {
      text: 'Is your body a little easier than it was? Even five per cent counts.',
      speakSeconds: 12,
      silenceSeconds: 10,
    },
  ],
};

/** The physiological sigh — 3 minutes: 80 s of intro, 40 s of cycles, 60 s of outro. */
export const soupirPhysiologique: ProgramContent = {
  type: 'breathing',
  intro: [
    {
      text: 'This one works very quietly, even with people around: a queue, a train, a meeting. Nobody will notice a thing.',
      speakSeconds: 20,
      silenceSeconds: 20,
    },
    {
      text: 'How it works: one big breath in through the nose, then a tiny second breath in on top of it, then a long breath out through the mouth.',
      speakSeconds: 22,
      silenceSeconds: 18,
    },
  ],
  cycles: 5,
  phases: [
    { label: 'Big breath in through the nose', seconds: 2 },
    { label: 'Small extra breath in', seconds: 1 },
    { label: 'Long breath out, gently', seconds: 5 },
  ],
  outro: [
    { text: 'Go back to breathing normally.', speakSeconds: 12, silenceSeconds: 18 },
    {
      text: 'You can run the sequence again later in the day, as many times as you need.',
      speakSeconds: 14,
      silenceSeconds: 16,
    },
  ],
};

/** Staircase breathing — 6 minutes, 360 s. Three steps, and no countdown. */
export const respirationEscalier: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'We are going to slow your breathing down in steps. Three levels, each slower than the last. Count in your head, at your own pace.',
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: 'Level one: in for three seconds, out for four. About five rounds.',
      speakSeconds: 16,
      silenceSeconds: 39,
    },
    {
      text: 'Level two: in for four, out for five. About five more rounds.',
      speakSeconds: 14,
      silenceSeconds: 51,
    },
    {
      text: 'Level three: in for four, out for six. Stay there as long as it is comfortable.',
      speakSeconds: 16,
      silenceSeconds: 84,
    },
    {
      text: 'If you feel short of breath or light-headed, stop counting and go back to breathing naturally. That is the right response, not giving up.',
      speakSeconds: 18,
      silenceSeconds: 32,
    },
    {
      text: 'The point is not to beat a record. It is to see that you can change your state by slowing down, and that the lever stays available.',
      speakSeconds: 20,
      silenceSeconds: 40,
    },
  ],
};
