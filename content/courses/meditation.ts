// The “Discovering meditation” course — ten days, 2 to 6 minutes.
//
// The duration climbs gently, but that is not what is being learnt here. What is being learnt is
// noticing that the attention has wandered off, and coming back — day 3 says so outright, and
// every day after it repeats the same thing in another form.
//
// Each day adds one tool and keeps the previous one as a fallback: if counting gets in the way,
// go back to the breath; if the breath gets in the way, go back to the contact. Nobody is ever
// left without an option.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** Day 1 — Find an anchor, 2 minutes. */
export const meditationJour1: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Day one. Settle however you can. You can close your eyes, or rest your gaze in front of you.',
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: 'We are looking for an anchor: your feet touching the floor, or your hands where they rest. Choose whichever you feel most easily.',
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: 'Stay with that sensation. That is all we are doing today: putting your attention somewhere.',
      speakSeconds: 15,
      silenceSeconds: 15,
    },
    {
      text: 'You have just done two minutes. That was the only goal.',
      speakSeconds: 15,
      silenceSeconds: 15,
    },
  ],
};

/** Day 2 — Follow one movement, 3 minutes. */
export const meditationJour2: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Yesterday, an anchor. Today, something that moves: your breathing.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'Do not change it. Only notice the air coming in, the air going out, or your stomach rising.',
      speakSeconds: 16,
      silenceSeconds: 19,
    },
    {
      text: 'If watching your breath makes you uneasy, that is common: go back to yesterday’s anchor, your feet or your hands. That is not a retreat, it is another door.',
      speakSeconds: 18,
      silenceSeconds: 22,
    },
    {
      text: 'Carry on following the movement, without correcting it.',
      speakSeconds: 12,
      silenceSeconds: 28,
    },
    {
      text: 'That is it for today.',
      speakSeconds: 10,
      silenceSeconds: 25,
    },
  ],
};

/** Day 3 — Just come back, 3 minutes. The heart of the course. */
export const meditationJour3: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Today is the most important day of the course. We are going to learn how to come back.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'Put your attention on your breath, or on your anchor. At some point your mind will go elsewhere. That is certain, and it is not a problem.',
      speakSeconds: 18,
      silenceSeconds: 17,
    },
    {
      text: 'You may just have noticed that your attention was elsewhere. You can find your anchor again now. That moment, that switch, is the whole exercise.',
      speakSeconds: 20,
      silenceSeconds: 20,
    },
    {
      text: 'Do it again as many times as it takes. Ten times in three minutes is a very good score.',
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: 'Wandering off and coming back is not failing at meditation. It is doing it.',
      speakSeconds: 13,
      silenceSeconds: 22,
    },
  ],
};

/** Day 4 — A small count, 4 minutes. */
export const meditationJour4: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'One more tool today: counting. It gives the mind something to hold on to.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'On each breath out, count: one, two, three, four, five. Then start again at one.',
      speakSeconds: 16,
      silenceSeconds: 24,
    },
    {
      text: 'If you lose count, start again at one. That is not a punishment — it is exactly yesterday’s return, with numbers on it.',
      speakSeconds: 17,
      silenceSeconds: 28,
    },
    {
      text: 'Carry on at your own pace.',
      speakSeconds: 10,
      silenceSeconds: 35,
    },
    {
      text: 'If you catch yourself counting fast to do it properly, slow down. The count follows the breath, not the other way round.',
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: 'That is the end for today.',
      speakSeconds: 10,
      silenceSeconds: 25,
    },
  ],
};

/** Day 5 — Drop the count, 4 minutes. */
export const meditationJour5: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Today we take one support away. Start as you did yesterday: count five breaths out.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'A few more counted rounds, calmly.',
      speakSeconds: 12,
      silenceSeconds: 28,
    },
    {
      text: 'Now stop counting. Stay with the breath, without numbers. You may notice it is harder: that is normal, you have just removed a handrail.',
      speakSeconds: 20,
      silenceSeconds: 25,
    },
    {
      text: 'Carry on without counting.',
      speakSeconds: 10,
      silenceSeconds: 35,
    },
    {
      text: 'If you get too lost, you are allowed to pick the count back up. Taking a support back is not a failure.',
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: 'That is the end.',
      speakSeconds: 10,
      silenceSeconds: 25,
    },
  ],
};

/** Day 6 — Recognise a thought, 5 minutes. */
export const meditationJour6: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Until now we came back as soon as we wandered off. Today we name it first.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'When you notice you are following a thought, simply say to yourself: a thought. Without looking into what it is about.',
      speakSeconds: 18,
      silenceSeconds: 22,
    },
    {
      text: 'Then come back to your breath. Name it, come back. That is all.',
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: 'Try it now, with me saying nothing.',
      speakSeconds: 10,
      silenceSeconds: 40,
    },
    {
      text: 'You will notice some thoughts keep coming back. Naming them does not make them disappear, and that is not the point.',
      speakSeconds: 16,
      silenceSeconds: 34,
    },
    {
      text: 'A little longer.',
      speakSeconds: 10,
      silenceSeconds: 35,
    },
    {
      text: 'Naming opens a small gap between you and what you are thinking. That gap is all we are after.',
      speakSeconds: 15,
      silenceSeconds: 25,
    },
  ],
};

/** Day 7 — Make room for what is here, 5 minutes. */
export const meditationJour7: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Today we look at what is here. If it is too much, you can go back to the breath at any point: that is an option, not giving up.',
      speakSeconds: 17,
      silenceSeconds: 14,
    },
    {
      text: 'Is there an emotion here right now? Irritation, tiredness, worry, or nothing in particular.',
      speakSeconds: 18,
      silenceSeconds: 22,
    },
    {
      text: 'If you find one, see whether it can be felt somewhere in the body. The throat, the chest, the stomach.',
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: 'You do not have to change it. Only let it have the room it is already taking.',
      speakSeconds: 12,
      silenceSeconds: 38,
    },
    {
      text: 'Now find something concrete again: your hands, your feet, your breath.',
      speakSeconds: 14,
      silenceSeconds: 36,
    },
    {
      text: 'Stay there for a few moments.',
      speakSeconds: 10,
      silenceSeconds: 35,
    },
    {
      text: 'Accepting is not liking. It is stopping the fight against something that has already happened.',
      speakSeconds: 15,
      silenceSeconds: 25,
    },
  ],
};

/** Day 8 — Come back through sound, 5 minutes. */
export const meditationJour8: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'A third door today, after the body and the breath: sound.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'Listen to what is around you. Do not try to identify anything: let the sounds arrive and leave.',
      speakSeconds: 18,
      silenceSeconds: 22,
    },
    {
      text: 'Sounds have one advantage: they renew themselves. There is always something to listen to, even the quiet of a room.',
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: 'Carry on listening.',
      speakSeconds: 10,
      silenceSeconds: 40,
    },
    {
      text: 'When you wander off, come back to the nearest sound.',
      speakSeconds: 12,
      silenceSeconds: 38,
    },
    {
      text: 'A little longer.',
      speakSeconds: 10,
      silenceSeconds: 35,
    },
    {
      text: 'You now have three anchors to choose from. That is useful: on different days, one works better than the others.',
      speakSeconds: 15,
      silenceSeconds: 25,
    },
  ],
};

/** Day 9 — Choose your anchor, 6 minutes. */
export const meditationJour9: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Today you are the one choosing. Breath, contact with the body, or sound.',
      speakSeconds: 18,
      silenceSeconds: 17,
    },
    {
      text: 'Choose now, and keep that choice to the end of the session, even if it does not seem like the right one.',
      speakSeconds: 16,
      silenceSeconds: 34,
    },
    {
      text: 'Settle in with your anchor. I am going to say a great deal less today.',
      speakSeconds: 13,
      silenceSeconds: 42,
    },
    {
      text: 'Come back when you wander off.',
      speakSeconds: 8,
      silenceSeconds: 52,
    },
    {
      text: 'Carry on.',
      speakSeconds: 6,
      silenceSeconds: 54,
    },
    {
      text: 'Holding an imperfect choice beats switching anchor the moment it gets uncomfortable. That is true here, and not only here.',
      speakSeconds: 16,
      silenceSeconds: 39,
    },
    {
      text: 'A few moments more.',
      speakSeconds: 10,
      silenceSeconds: 35,
    },
  ],
};

/** Day 10 — A pause that fits you, 6 minutes. */
export const meditationJour10: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Last day. We run the whole sequence: settle, choose, wander off, come back.',
      speakSeconds: 18,
      silenceSeconds: 17,
    },
    {
      text: 'Settle in, and choose your anchor.',
      speakSeconds: 12,
      silenceSeconds: 38,
    },
    {
      text: 'Stay with it. When you wander off, come back, with no commentary.',
      speakSeconds: 13,
      silenceSeconds: 42,
    },
    {
      text: 'Carry on alone.',
      speakSeconds: 8,
      silenceSeconds: 52,
    },
    {
      text: 'A little longer.',
      speakSeconds: 8,
      silenceSeconds: 52,
    },
    {
      text: 'From here, pick a moment that already exists in your day: the morning coffee, the commute, the moment before sleep. One minute is enough to make this move again.',
      speakSeconds: 20,
      silenceSeconds: 35,
    },
    {
      text: 'You have done ten days. You now know what this is like, and that is something you cannot read — only practise.',
      speakSeconds: 15,
      silenceSeconds: 30,
    },
  ],
};
