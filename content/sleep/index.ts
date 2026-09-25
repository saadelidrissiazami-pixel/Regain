// Sleep sessions, narrated.
//
// What sets this theme apart: they are listened to in bed, often with the eyes already closed. So
// they end without asking for anything — no buzz, no review to fill in, no question. That is what
// `endsQuietly` is for. Only the first is an exception: it marks the transition before bed, while
// you are still up.
//
// None of them promises sleep. Checking whether sleep is coming is precisely what keeps it away,
// and a session that promises sleep creates exactly that checking.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** Slow down before sleep — 1 minute, 60 s. Before bed, so the review is still offered. */
export const ralentirAvantDormir: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Turn your screen off, or put it somewhere away from you. That is the only thing to do this minute.',
      speakSeconds: 14,
      silenceSeconds: 6,
    },
    {
      text: 'Take one slow breath, without changing anything else.',
      speakSeconds: 12,
      silenceSeconds: 13,
    },
    {
      text: 'There is nothing left to get done today. The rest will wait until tomorrow.',
      speakSeconds: 10,
      silenceSeconds: 5,
    },
  ],
};

/** Release the tension — 3 minutes, 180 s. */
export const relacherTensions: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'Lie down comfortably. Dim the light if you can. You do not need to do anything well any more.',
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: 'Let your shoulders come back down. A centimetre is enough.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'Unclench your jaw a little. That is often where the day stays hooked.',
      speakSeconds: 16,
      silenceSeconds: 19,
    },
    {
      text: 'With every breath out, the day moves a little further off. You do not have to help it.',
      speakSeconds: 14,
      silenceSeconds: 21,
    },
    {
      text: 'Your legs are heavy, resting. No effort required.',
      speakSeconds: 12,
      silenceSeconds: 18,
    },
    {
      text: 'The voice is going to stop. There is nothing left to do.',
      speakSeconds: 12,
      silenceSeconds: 8,
    },
  ],
};

/** Full body scan — 6 minutes, 360 s. */
export const scanCorporelComplet: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'Lie down and let your body sink into the mattress. We will travel slowly through it, fixing nothing.',
      speakSeconds: 20,
      silenceSeconds: 15,
    },
    {
      text: 'Your feet. Let them go without moving them, on intention alone.',
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: 'Move up to the legs. Feel their weight, and let them loosen a little further.',
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: 'Your stomach rises and falls, at its own pace, with no help from you.',
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: 'Your shoulders. They can come down a little more, even if you thought they were relaxed.',
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: 'Your face. The forehead, around the eyes, the jaw.',
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: 'Now feel your whole body, heavy and settled.',
      speakSeconds: 16,
      silenceSeconds: 34,
    },
    {
      text: 'That is the end. Nothing to confirm, nothing to tap.',
      speakSeconds: 12,
      silenceSeconds: 38,
    },
  ],
};

/** Breathing towards sleep — 8 minutes, 480 s. */
export const respirationEndormissement: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'Lie down, dim the light, let your hands rest comfortably.',
      speakSeconds: 20,
      silenceSeconds: 20,
    },
    {
      text: 'To start with, breathe normally. Change nothing, just watch.',
      speakSeconds: 16,
      silenceSeconds: 39,
    },
    {
      text: 'Now slow it down a little: in for about four seconds, out for about six. Never holding your breath. If that is uncomfortable, go back to your natural rhythm.',
      speakSeconds: 22,
      silenceSeconds: 38,
    },
    {
      text: 'With every breath out, a little heavier. Start with the feet.',
      speakSeconds: 12,
      silenceSeconds: 48,
    },
    {
      text: 'The legs, then the stomach.',
      speakSeconds: 14,
      silenceSeconds: 51,
    },
    {
      text: 'The shoulders.',
      speakSeconds: 12,
      silenceSeconds: 53,
    },
    {
      text: 'The face.',
      speakSeconds: 12,
      silenceSeconds: 53,
    },
    {
      text: 'If you lost the thread, it does not matter: nobody holds eight minutes without drifting off somewhere. The voice stops here.',
      speakSeconds: 15,
      silenceSeconds: 55,
    },
  ],
};

/** Putting the mind on standby — 7 minutes, 420 s. */
export const cerveauEnVeille: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'Close your eyes. Tonight we are not going to solve anything. We are only going to put things away.',
      speakSeconds: 22,
      silenceSeconds: 18,
    },
    {
      text: 'Picture a box beside you. Every thought that arrives, you put in it. You do not argue with it.',
      speakSeconds: 20,
      silenceSeconds: 35,
    },
    {
      text: 'A thought arrives — “tomorrow I have to…”. Into the box. Not now, tomorrow.',
      speakSeconds: 18,
      silenceSeconds: 42,
    },
    {
      text: 'Another one — “what if…”. Into the box as well. You are not fighting anything, you are filing.',
      speakSeconds: 20,
      silenceSeconds: 45,
    },
    {
      text: 'Carry on alone. Each time you notice a thought, put it away and come back to your breathing.',
      speakSeconds: 12,
      silenceSeconds: 58,
    },
    {
      text: 'If one task really insists, you can write it on a piece of paper by the bed. Your mind stops repeating it as soon as it knows it will not be forgotten.',
      speakSeconds: 20,
      silenceSeconds: 45,
    },
    {
      text: 'The box stays there. It will still be full tomorrow, and that will be perfectly fine.',
      speakSeconds: 15,
      silenceSeconds: 50,
    },
  ],
};

/** The monotonous journey — 7 minutes, 420 s. */
export const voyageMentalMonotone: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'Picture somewhere quiet. An empty beach, a path you know. Above all, not a gripping story.',
      speakSeconds: 20,
      silenceSeconds: 20,
    },
    {
      text: 'We are after monotony, not escape. Details that repeat: a step, then a wave. A step, then a wave.',
      speakSeconds: 18,
      silenceSeconds: 37,
    },
    {
      text: 'I am walking. I can hear the waves. A step. A wave.',
      speakSeconds: 14,
      silenceSeconds: 46,
    },
    {
      text: 'I look at the sand. A step. A wave.',
      speakSeconds: 12,
      silenceSeconds: 53,
    },
    {
      text: 'Carry on at your own pace.',
      speakSeconds: 10,
      silenceSeconds: 60,
    },
    {
      text: 'If your mind starts telling a story, simply come back to: a step, a wave.',
      speakSeconds: 16,
      silenceSeconds: 49,
    },
    {
      text: 'If the pictures go blurry or disappear, let them go. That is not a failure — it is often the sign that sleep is close.',
      speakSeconds: 14,
      silenceSeconds: 53,
    },
  ],
};
