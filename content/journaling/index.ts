// Writing sessions, narrated.
//
// Here the silence is not a breath: it is the time to write. So it is markedly longer than
// elsewhere, and deliberately so — a question followed by eight seconds is a question you have no
// time to ask yourself.
//
// These sessions need paper or the Notes app, and say so from the start.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** Quick gratitude — 1 minute, 60 s. */
export const gratitudeExpress: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'One question only, and you do not even have to write it down. What small good thing happened today?',
      speakSeconds: 12,
      silenceSeconds: 8,
    },
    {
      text: 'Who or what helped you, even a little, even without knowing it?',
      speakSeconds: 10,
      silenceSeconds: 15,
    },
    {
      text: 'Keep it to yourself. That was the point.',
      speakSeconds: 10,
      silenceSeconds: 5,
    },
  ],
};

/** Clear your day — 3 minutes, 180 s. */
export const clarifierJournee: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Think back over your day, without judging it. We are only going to look at it.',
      speakSeconds: 16,
      silenceSeconds: 9,
    },
    {
      text: 'What took up the most room today? In your time, or in your head — the two are not always the same thing.',
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: 'Was there a moment, however tiny, that did you good?',
      speakSeconds: 12,
      silenceSeconds: 28,
    },
    {
      text: 'What would you do differently tomorrow, if the chance came round again?',
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: 'You do not have to write any of it down. Just let those answers settle.',
      speakSeconds: 15,
      silenceSeconds: 20,
    },
  ],
};

/** Empty your head — 4 minutes, 240 s. */
export const viderSaTete: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'If your head is full, this is for getting some of it out. Not for solving all of it.',
      speakSeconds: 18,
      silenceSeconds: 12,
    },
    {
      text: 'What has been going round and round for a while now?',
      speakSeconds: 12,
      silenceSeconds: 28,
    },
    {
      text: 'Is it something to do, something to decide, or just something to feel? The three are not handled the same way.',
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: 'If it is something to do: what would the very first small step be? Not the plan, just the first step.',
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: 'If it is something to decide: what are you missing? Time, a piece of information, somebody else’s view? And if it is only a feeling, it does not need settling — only noticing.',
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: 'One last question. In all of that, what is not really yours to carry?',
      speakSeconds: 15,
      silenceSeconds: 25,
    },
  ],
};

/** The mental offload — 7 minutes, 420 s. With a real stretch of free writing. */
export const dechargementMental: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'For this one you need paper or the Notes app. Fetch it now, I will wait.',
      speakSeconds: 20,
      silenceSeconds: 15,
    },
    {
      text: 'You are going to write down everything going through your head. No grammar, no structure, no reading back. Even “I do not know what to write” counts, and you keep going.',
      speakSeconds: 18,
      silenceSeconds: 12,
    },
    {
      text: 'Off you go. Write without stopping — I will say nothing for three minutes.',
      speakSeconds: 12,
      silenceSeconds: 168,
    },
    {
      text: 'Stop there. Read it back, and split what you wrote in two: what is under your control, and what is not. Your decisions and your actions are. The past and other people’s reactions are not.',
      speakSeconds: 20,
      silenceSeconds: 40,
    },
    {
      text: 'In the “under my control” column, choose one single action. One. For instance: send that message.',
      speakSeconds: 18,
      silenceSeconds: 32,
    },
    {
      text: 'You can throw the paper away. What mattered is that it is out of your head.',
      speakSeconds: 15,
      silenceSeconds: 50,
    },
  ],
};

/** The confidence journal — 6 minutes, 360 s. */
export const journalDeConfiance: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Five questions. One sentence each is plenty, in your head or on paper.',
      speakSeconds: 18,
      silenceSeconds: 12,
    },
    {
      text: 'What did you do today in spite of something being hard? However small. Especially if it was small.',
      speakSeconds: 14,
      silenceSeconds: 46,
    },
    {
      text: 'Which situation did you handle better than you would have a year ago?',
      speakSeconds: 14,
      silenceSeconds: 46,
    },
    {
      text: 'What does that say about you? For instance: I am able to keep going even when it is uncomfortable.',
      speakSeconds: 16,
      silenceSeconds: 54,
    },
    {
      text: 'What small act of courage did you manage? Asking a question, saying no, trying something new.',
      speakSeconds: 16,
      silenceSeconds: 54,
    },
    {
      text: 'And to finish: what small, doable thing will you risk tomorrow?',
      speakSeconds: 15,
      silenceSeconds: 55,
    },
  ],
};

/** Turn a fear into a plan — 8 minutes, 480 s. */
export const peurEnPlan: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'What exactly are you afraid of? Take the time to put it into words, even if that is unpleasant.',
      speakSeconds: 14,
      silenceSeconds: 41,
    },
    {
      text: 'What is the worst-case story your mind is building? Be specific. Vague fears are the heaviest to carry.',
      speakSeconds: 16,
      silenceSeconds: 49,
    },
    {
      text: 'How likely is it, really, that this happens? You do not need an accurate number — an honest hunch will do.',
      speakSeconds: 16,
      silenceSeconds: 49,
    },
    {
      text: 'And if it did happen anyway, what could you do? Look for three possibilities, imperfect ones included.',
      speakSeconds: 18,
      silenceSeconds: 62,
    },
    {
      text: 'What is genuinely under your control in this situation?',
      speakSeconds: 16,
      silenceSeconds: 54,
    },
    {
      text: 'And what is not under your control at all, but you are carrying anyway?',
      speakSeconds: 16,
      silenceSeconds: 54,
    },
    {
      text: 'To finish: you do not need to be certain everything will go well. You only need to know that you will be able to face whatever does happen.',
      speakSeconds: 20,
      silenceSeconds: 55,
    },
  ],
};
