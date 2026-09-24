// The “Sleeping better” course — ten days, 3 to 7 minutes.
//
// The thread running through it is taking effort away, not adding any. No day promises sleep:
// checking whether sleep is coming is exactly what pushes it back, and a promise creates that
// checking.
//
// Days 1 and 6 are done standing up, before bed — so they keep the closing review. All the others
// are listened to in bed and end in silence, asking for nothing.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** Day 1 — End the day, 3 minutes. Before bed. */
export const sommeilJour1: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Day one, and it is done on your feet. We are going to mark the end of the day, before even thinking about sleep.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'Look at what is still unfinished around you. Choose one single thing to suspend for tonight, and leave it where it is.',
      speakSeconds: 16,
      silenceSeconds: 19,
    },
    {
      text: 'Now choose what you will do until bedtime: something quiet, and something you like. Reading, listening, tidying gently.',
      speakSeconds: 18,
      silenceSeconds: 22,
    },
    {
      text: 'That switch counts for more than people think. The body needs a border between the day and the night, and nothing draws it for you.',
      speakSeconds: 16,
      silenceSeconds: 24,
    },
    {
      text: 'That is all for today. Tomorrow we will already be in bed.',
      speakSeconds: 13,
      silenceSeconds: 22,
    },
  ],
};

/** Day 2 — Feel the bed hold you, 3 minutes. */
export const sommeilJour2: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'You are in bed. We are going to do nothing but notice where your body is held.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'Find a first point of contact with the mattress or the pillow. Your head, a shoulder, the small of your back.',
      speakSeconds: 16,
      silenceSeconds: 19,
    },
    {
      text: 'A second one, somewhere else.',
      speakSeconds: 10,
      silenceSeconds: 30,
    },
    {
      text: 'And a third, if you find one.',
      speakSeconds: 10,
      silenceSeconds: 30,
    },
    {
      text: 'The bed is holding all of you. There is nothing for you to hold.',
      speakSeconds: 13,
      silenceSeconds: 22,
    },
  ],
};

/** Day 3 — Let it breathe, 4 minutes. */
export const sommeilJour3: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'Today, the breath — but with no rhythm to follow. We are only watching.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'Notice a few breaths exactly as they come. Do not lengthen them, do not slow them down.',
      speakSeconds: 16,
      silenceSeconds: 24,
    },
    {
      text: 'If you catch yourself wanting to breathe well, let it go: that is another effort, and we are taking effort away, not adding it.',
      speakSeconds: 17,
      silenceSeconds: 28,
    },
    {
      text: 'Now come back to yesterday’s contacts, the bed underneath you.',
      speakSeconds: 12,
      silenceSeconds: 33,
    },
    {
      text: 'Breath, or contact. Both are there if you need them.',
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: 'That is the end.',
      speakSeconds: 10,
      silenceSeconds: 25,
    },
  ],
};

/** Day 4 — Loosen gently, 4 minutes. */
export const sommeilJour4: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'We are going to let three places go, without tensing them first. Tensing in order to relax better wakes you up more than anything else.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'The hands. Let the fingers open a little, of their own accord.',
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: 'The jaw. Your teeth do not need to be touching.',
      speakSeconds: 13,
      silenceSeconds: 32,
    },
    {
      text: 'The shoulders. They can come down a centimetre, no more than that.',
      speakSeconds: 13,
      silenceSeconds: 32,
    },
    {
      text: 'If nothing loosens, it does not matter. You still stopped clenching for a minute.',
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: 'That is it.',
      speakSeconds: 10,
      silenceSeconds: 25,
    },
  ],
};

/** Day 5 — Travel through the body, 5 minutes. */
export const sommeilJour5: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'We take yesterday’s places and travel through the whole body, feet to head.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'The feet. Without moving them, just by putting your attention there.',
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: 'The legs, then the hips.',
      speakSeconds: 12,
      silenceSeconds: 33,
    },
    {
      text: 'The stomach, the back, the chest.',
      speakSeconds: 12,
      silenceSeconds: 38,
    },
    {
      text: 'The hands, the arms, the shoulders.',
      speakSeconds: 12,
      silenceSeconds: 38,
    },
    {
      text: 'The jaw, the face, the forehead.',
      speakSeconds: 12,
      silenceSeconds: 33,
    },
    {
      text: 'The whole body, all of a piece.',
      speakSeconds: 12,
      silenceSeconds: 28,
    },
  ],
};

/** Day 6 — Put down what is left, 5 minutes. Before bed, with paper. */
export const sommeilJour6: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'This one is done before you get into bed, with paper and a pen. Fetch them now.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'Write down one worry. Just one, the one that comes back most. Take the time to put all of it into words.',
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: 'Read it back. Does it actually say what worries you, or only the part that shows?',
      speakSeconds: 15,
      silenceSeconds: 30,
    },
    {
      text: 'Underneath, write one very small action that is possible tomorrow. Not the solution: the first step.',
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: 'Close the notebook, or turn the paper over. That gesture counts: your mind stops repeating what it knows is recorded somewhere else.',
      speakSeconds: 18,
      silenceSeconds: 32,
    },
    {
      text: 'If other worries are left, they can wait for tomorrow’s page.',
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: 'You can go to bed.',
      speakSeconds: 12,
      silenceSeconds: 23,
    },
  ],
};

/** Day 7 — Recognise the script, 5 minutes. */
export const sommeilJour7: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'Tonight we deal with the thoughts that go round. We are not going to solve them.',
      speakSeconds: 16,
      silenceSeconds: 14,
    },
    {
      text: 'When a worry comes back, name it: there is that worry. Then find a point of contact with the bed again.',
      speakSeconds: 18,
      silenceSeconds: 22,
    },
    {
      text: 'That worry is back. You can recognise it without carrying on the argument now.',
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: 'Try it, with me saying nothing.',
      speakSeconds: 10,
      silenceSeconds: 40,
    },
    {
      text: 'If the same one comes back ten times, name it ten times. That is not a failure, it is practice.',
      speakSeconds: 14,
      silenceSeconds: 36,
    },
    {
      text: 'A little longer.',
      speakSeconds: 10,
      silenceSeconds: 35,
    },
    {
      text: 'The night is not the right time to decide anything. Nothing you settled now would hold tomorrow.',
      speakSeconds: 15,
      silenceSeconds: 25,
    },
  ],
};

/** Day 8 — Return to a familiar place, 6 minutes. */
export const sommeilJour8: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'Tonight, a place. Not a dream place: somewhere real that you know, quiet or simply unremarkable.',
      speakSeconds: 18,
      silenceSeconds: 17,
    },
    {
      text: 'Choose it. A room, a path, a beach you saw once.',
      speakSeconds: 14,
      silenceSeconds: 36,
    },
    {
      text: 'What do you see first? Stay with one detail, not the whole of it.',
      speakSeconds: 15,
      silenceSeconds: 40,
    },
    {
      text: 'What can you hear there?',
      speakSeconds: 10,
      silenceSeconds: 50,
    },
    {
      text: 'And what can you feel under your feet, or on your skin?',
      speakSeconds: 12,
      silenceSeconds: 48,
    },
    {
      text: 'If the place blurs or disappears, let it go. Come back to the contacts of the bed: they are always there.',
      speakSeconds: 15,
      silenceSeconds: 40,
    },
    {
      text: 'Stay wherever you like, there or here.',
      speakSeconds: 10,
      silenceSeconds: 35,
    },
  ],
};

/** Day 9 — Let sleep come, 6 minutes. */
export const sommeilJour9: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'Tonight we deal with the effort itself. The effort of trying to fall asleep.',
      speakSeconds: 18,
      silenceSeconds: 17,
    },
    {
      text: 'Notice whether part of you is keeping watch: is it coming? is this working? It is that watching that keeps you awake, not the noise and not the thoughts.',
      speakSeconds: 20,
      silenceSeconds: 30,
    },
    {
      text: 'You do not have to check whether sleep is coming. For now, simply let your body find a comfortable position.',
      speakSeconds: 15,
      silenceSeconds: 40,
    },
    {
      text: 'Choose a technique you already know: the contacts, the breath, yesterday’s place. Whichever suits you tonight.',
      speakSeconds: 15,
      silenceSeconds: 45,
    },
    {
      text: 'Stay with it, expecting no result.',
      speakSeconds: 10,
      silenceSeconds: 50,
    },
    {
      text: 'Resting with your eyes closed is already worth something, even without sleep. It takes the stakes away, and the stakes are the problem.',
      speakSeconds: 15,
      silenceSeconds: 40,
    },
    {
      text: 'Nothing left to do.',
      speakSeconds: 10,
      silenceSeconds: 35,
    },
  ],
};

/** Day 10 — Build your own ritual, 7 minutes. */
export const sommeilJour10: ProgramContent = {
  type: 'narrated',
  endsQuietly: true,
  blocks: [
    {
      text: 'Last night. We put it together: one transition before bed, and one single exercise once you are lying down.',
      speakSeconds: 18,
      silenceSeconds: 17,
    },
    {
      text: 'The transition first. What will mark the end of your day tomorrow evening? One simple thing that you will actually do.',
      speakSeconds: 18,
      silenceSeconds: 32,
    },
    {
      text: 'Then one exercise for the bed. The contacts, the loosening, the travel through the body, the familiar place. Whichever you liked best.',
      speakSeconds: 18,
      silenceSeconds: 37,
    },
    {
      text: 'Do it now, the one you have just chosen. I will leave you to it.',
      speakSeconds: 12,
      silenceSeconds: 48,
    },
    {
      text: 'Carry on.',
      speakSeconds: 8,
      silenceSeconds: 52,
    },
    {
      text: 'Two things is ritual enough. Three, and nobody keeps it up.',
      speakSeconds: 14,
      silenceSeconds: 46,
    },
    {
      text: 'If the nights stay hard for several weeks, talking to a doctor is worth more than any exercise: there are treatments that genuinely work.',
      speakSeconds: 20,
      silenceSeconds: 35,
    },
    {
      text: 'Good night.',
      speakSeconds: 10,
      silenceSeconds: 35,
    },
  ],
};
