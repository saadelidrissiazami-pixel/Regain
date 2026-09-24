// Narrated meditations.
//
// Each session runs on its own: a block of text, then a silence to live it in. The durations are
// written by hand rather than estimated, and their sum is the session's real length —
// tests/narration.test.ts and tests/catalogue.test.ts make sure it matches what the catalogue
// claims.
//
// They all follow the same arc: settle in, find something concrete to rest on, choose a point of
// attention, learn what to do when a thought arrives, practise with less guidance, accept
// whatever state you are in, come back. The silence lengthens once the move has been taught, then
// tightens on the way out. Nothing asks you to feel better.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** 1 minute — 60 s. */
export const pauseUneMinute: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'One minute, right where you are. You can close your eyes, or just lower your gaze.',
      speakSeconds: 12,
      silenceSeconds: 8,
    },
    {
      text: 'Let three breaths go by without changing anything. You are watching, not correcting.',
      speakSeconds: 10,
      silenceSeconds: 18,
    },
    {
      text: 'That is already it. Pick things up whenever you want.',
      speakSeconds: 8,
      silenceSeconds: 4,
    },
  ],
};

/** Morning anchor — 3 minutes, 180 s. */
export const ancrageMatin: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Settle however you can, sitting or lying down. You can close your eyes or rest your gaze in front of you. You can move, or stop, at any point.',
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: 'Notice where your body meets whatever is holding it: the chair, the bed, the floor. Pick one place where that contact is easy to feel.',
      speakSeconds: 18,
      silenceSeconds: 12,
    },
    {
      text: 'If it is comfortable, notice the movement of your breathing now. Let it keep its own rhythm, without stretching it out.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'Thoughts will arrive, and that is normal. When you notice you are following one, simply come back to your anchor. That return is the whole exercise.',
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: 'I will leave you a little silence. Come back to your anchor whenever you think of it.',
      speakSeconds: 10,
      silenceSeconds: 15,
    },
    {
      text: 'Ask yourself this, without answering straight away: what do I need today?',
      speakSeconds: 14,
      silenceSeconds: 6,
    },
    {
      text: 'Notice the sounds around you. Open your eyes in your own time.',
      speakSeconds: 10,
      silenceSeconds: 5,
    },
  ],
};

/** Evening meditation — 5 minutes, 300 s. Ends without asking for anything. */
export const meditationSoir: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'Settle where you are, without trying to be somewhere else. The day is behind you, even if it went badly.',
      speakSeconds: 22,
      silenceSeconds: 13,
    },
    {
      text: 'Let the day go past without judging it, like scenery through a window. You do not have to sum it up.',
      speakSeconds: 20,
      silenceSeconds: 30,
    },
    {
      text: 'Is there something you are still carrying? A tightness, a sentence, a thought that keeps coming back.',
      speakSeconds: 20,
      silenceSeconds: 30,
    },
    {
      text: 'You do not have to solve it now. You can simply recognise it, and set it down beside you for tonight. It will still be there tomorrow if it matters.',
      speakSeconds: 22,
      silenceSeconds: 28,
    },
    {
      text: 'Feel the weight of your body settling a little further with each breath out.',
      speakSeconds: 16,
      silenceSeconds: 34,
    },
    {
      text: 'There is nothing left to get done today. Even if the list is unfinished, it can wait for daylight.',
      speakSeconds: 18,
      silenceSeconds: 22,
    },
    {
      text: 'The voice is going to stop now. There is nothing to confirm, nothing to tap.',
      speakSeconds: 15,
      silenceSeconds: 10,
    },
  ],
};

/** Five senses — 5 minutes, 300 s. */
export const meditationCinqSens: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Keep your eyes open for this one. We will go through the five senses, one at a time, unhurried. Nothing to get right.',
      speakSeconds: 22,
      silenceSeconds: 8,
    },
    {
      text: 'Sight. Find five things you can see around you. Name them in your head, without judging them. Take your time over all five.',
      speakSeconds: 20,
      silenceSeconds: 40,
    },
    {
      text: 'Hearing. Now four sounds, however faint: a voice further off, a fan, your own breathing.',
      speakSeconds: 18,
      silenceSeconds: 37,
    },
    {
      text: 'Touch. Three physical sensations: your feet on the floor, fabric against your skin, the chair against your back.',
      speakSeconds: 18,
      silenceSeconds: 32,
    },
    {
      text: 'Smell. Two smells, however slight. If you cannot find any, simply stay attentive for a moment.',
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: 'Taste. One single sensation in your mouth, exactly as it is.',
      speakSeconds: 15,
      silenceSeconds: 20,
    },
    {
      text: 'You have been all the way round. You are here, now, and there is nothing to solve for these few minutes.',
      speakSeconds: 20,
      silenceSeconds: 5,
    },
  ],
};

/** Watching your thoughts — 8 minutes, 480 s. */
export const meditationObserverPensees: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Settle in and breathe normally. Close your eyes if that is comfortable, otherwise rest your gaze in front of you.',
      speakSeconds: 22,
      silenceSeconds: 13,
    },
    {
      text: 'Over these eight minutes you are not going to try to stop your thoughts. Nobody manages that, and it is not the point.',
      speakSeconds: 22,
      silenceSeconds: 23,
    },
    {
      text: 'Here is the move: when a thought arrives and you notice you are following it, say to yourself gently, “a thought”. Then come back to your breathing. No rush.',
      speakSeconds: 25,
      silenceSeconds: 35,
    },
    {
      text: 'If you think “I cannot do this”: a thought. Back to the breath. If you think “I should be doing something else”: a thought. Back to the breath.',
      speakSeconds: 22,
      silenceSeconds: 38,
    },
    {
      text: 'Try it on your own now. I will leave you some silence.',
      speakSeconds: 12,
      silenceSeconds: 63,
    },
    {
      text: 'Carry on. There is no score to beat, and noticing that you had wandered a long way off is already the thing working.',
      speakSeconds: 10,
      silenceSeconds: 70,
    },
    {
      text: 'You are not trying to get rid of your thoughts. You are learning the difference between having a thought and having to believe it, or act on it.',
      speakSeconds: 25,
      silenceSeconds: 35,
    },
    {
      text: 'A few moments more, then we will stop. A thought is not necessarily a fact.',
      speakSeconds: 20,
      silenceSeconds: 45,
    },
  ],
};

/** Body scan — 9 minutes, 540 s. */
export const meditationScanCorporel: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Sit or lie down. We will travel slowly through the body, from the bottom up. You are watching, not fixing anything.',
      speakSeconds: 22,
      silenceSeconds: 13,
    },
    {
      text: 'Start with your feet. Warmth, coolness, pressure, tightness. Whatever you find, and the absence of sensation too.',
      speakSeconds: 20,
      silenceSeconds: 40,
    },
    {
      text: 'Move up to the calves, then the thighs. Simply observe, without trying to relax anything.',
      speakSeconds: 18,
      silenceSeconds: 42,
    },
    {
      text: 'Your stomach. Notice the movement of the breath at exactly that spot.',
      speakSeconds: 18,
      silenceSeconds: 42,
    },
    {
      text: 'Your chest. The breathing carries on by itself, without you having to see to it.',
      speakSeconds: 16,
      silenceSeconds: 44,
    },
    {
      text: 'Your shoulders. Are they up around your ears? If they are, let them come down a centimetre. No more than that.',
      speakSeconds: 20,
      silenceSeconds: 45,
    },
    {
      text: 'Your jaw. Unclench your teeth, let your tongue rest. That is often where the day hangs on.',
      speakSeconds: 18,
      silenceSeconds: 42,
    },
    {
      text: 'Your face. The forehead, around the eyes, the cheeks, the mouth.',
      speakSeconds: 20,
      silenceSeconds: 45,
    },
    {
      text: 'To finish, take in your body as a whole. You do not have to make the sensations that remain go away — you can simply let them be there.',
      speakSeconds: 25,
      silenceSeconds: 50,
    },
  ],
};
