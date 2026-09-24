// SOS sessions: two minutes, to reach for at the moment things are bad.
//
// They do not look like the others, and that is deliberate. One instruction at a time, little
// explanation, eyes open, and a concrete way out at the end. There is no exploring what you feel:
// the attention turns outwards, because that is what helps in the moment.
//
// None of them asks for a big breath in or for holding the breath. Breathing hard while panicking
// often makes things worse, and a breathing instruction that fails becomes one more piece of
// evidence that you cannot do this.
//
// All four are free, and will stay free: putting content for distress behind a subscription is
// not defensible.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** Panic rising — 2 minutes. The attention goes to the room, not to the breath. */
export const sosAngoisse: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Keep your eyes open if you can. Look around and choose one object that is not moving. Notice its colour, then its shape. For the next few seconds you have nothing to do but look at it.',
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: 'Now notice one point of contact: your feet on the floor, your back against the seat, your hand on some fabric. Pick whichever suits you. Feel the surface, without pressing hard.',
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: 'Let your breathing happen, without trying to take big breaths in. Put your attention on a sound around you instead. Then on a second one, if there is one.',
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: 'This is nearly over. If you need somebody with you, you can call and say: “I am having a hard time, can you stay with me?” You do not have to wait for it to get worse before you ask.',
      speakSeconds: 20,
      silenceSeconds: 10,
    },
  ],
};

/** Before you speak up — 2 minutes. Not aiming for calm, preparing one move. */
export const sosPriseDeParole: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Feel your feet on the floor, or your body on the seat. Rest your gaze on something steady in front of you. You are allowed to take this moment before you start.',
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: 'If you can, unclench your jaw and your hands a little. Let one breath go by at your own pace. You do not need to make the nerves disappear — they are good for something too.',
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: 'Choose only your first sentence. For instance: “I am going to take you through the main point.” Say it once in your head, a little slower than usual.',
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: 'When it is time to start, find your footing, say your first sentence, then allow yourself a pause. You can speak with an imperfect voice and get there one sentence at a time.',
      speakSeconds: 15,
      silenceSeconds: 15,
    },
  ],
};

/** A spike of stress at work — 2 minutes. Discreet, eyes open, aimed at a decision. */
export const sosStressTravail: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'If you can stop safely, rest your hands for a moment and look away from the screen. The next reply can wait a few seconds.',
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: 'Feel a point of contact with the floor or the seat. Let your shoulders find a slightly more comfortable position. Breathe however it comes, without trying to get an exercise right.',
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: 'Ask yourself: what is the one useful thing, right now? A small action, a detail to ask about, or a break. You do not have to get through the whole list.',
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: 'Choose the most realistic next step. If what is being asked is beyond what you can do, you can say: “I need us to choose the priority.” Then move at your own pace.',
      speakSeconds: 15,
      silenceSeconds: 15,
    },
  ],
};

/**
 * Night-time rumination — 2 minutes, ending in silence.
 * No problem-solving, nothing projected onto tomorrow, and nothing asked at the end: all of that
 * would wake up precisely what we are trying to let settle.
 */
export const sosRuminations: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'A thought may be going round and round. For this moment, you do not need to finish the reasoning. You can simply recognise it: there is that worry.',
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: 'Notice one point of contact with the bed: your head on the pillow, a resting hand, the weight of a leg. Choose a fairly neutral sensation, and let your attention settle there.',
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: 'If the thought comes back, use the same words again: there is that worry. Then find the contact again. You can make that move as many times as it comes, without counting.',
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: 'The voice is going to stop. There is nothing to confirm, nothing to tap. For now, no answer is expected of you.',
      speakSeconds: 20,
      silenceSeconds: 10,
    },
  ],
};
