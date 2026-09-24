// Confidence sessions, narrated.
//
// Two of them ask you to stand up or to act for real: the silence there becomes a genuine stretch
// of time, not a breath. A session that says “do it” and then moves on ten seconds later never
// left time to do it.
//
// The register avoids the phrases people repeat without believing them. We are after evidence,
// not affirmations.

import type { ProgramContent } from '../../src/features/wellbeing/types';

/** Three qualities — 1 minute, 60 s. */
export const troisQualites: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'One quality the people close to you see in you, even if you play it down when they say so.',
      speakSeconds: 12,
      silenceSeconds: 8,
    },
    {
      text: 'One quality you had to build, which did not come naturally at first.',
      speakSeconds: 10,
      silenceSeconds: 15,
    },
    {
      text: 'And one thing you do well without even thinking about it.',
      speakSeconds: 10,
      silenceSeconds: 5,
    },
  ],
};

/** Remember something you did well — 3 minutes, 180 s. */
export const seRappelerReussite: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Think of a time, however modest, when you got something done that you were proud of.',
      speakSeconds: 16,
      silenceSeconds: 19,
    },
    {
      text: 'Where were you? What had you needed to get past to manage it?',
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: 'What does that say about you? Not about your luck that day — about you.',
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: 'That ability is still there. It did not get lost on the way.',
      speakSeconds: 12,
      silenceSeconds: 23,
    },
    {
      text: 'You do not have to get everything right at once. One step after another has already worked before.',
      speakSeconds: 15,
      silenceSeconds: 15,
    },
  ],
};

/** Prepare for a hard moment — 4 minutes, 240 s. */
export const preparationMomentDifficile: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Think about the moment coming up, the one making you nervous.',
      speakSeconds: 14,
      silenceSeconds: 16,
    },
    {
      text: 'What exactly are you dreading? Being judged, failing, somebody’s reaction?',
      speakSeconds: 16,
      silenceSeconds: 24,
    },
    {
      text: 'Has a version of this fear already happened? And how did it actually go — not in the memory you kept of it?',
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: 'What is the worst realistic outcome? Not the worst imaginable one: the most likely one if things go badly.',
      speakSeconds: 18,
      silenceSeconds: 27,
    },
    {
      text: 'You would survive that. It would not be pleasant, and you would carry on anyway.',
      speakSeconds: 14,
      silenceSeconds: 26,
    },
    {
      text: 'You do not need to feel a hundred per cent ready. Nobody is, and it gets done anyway.',
      speakSeconds: 20,
      silenceSeconds: 20,
    },
  ],
};

/** The posture of presence — 3 minutes, 180 s. Standing, with a real minute of walking. */
export const postureDePresence: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Stand up, feet roughly shoulder-width apart. Do not puff your chest out: we are not playing a character.',
      speakSeconds: 20,
      silenceSeconds: 10,
    },
    {
      text: 'Feel your feet on the floor. Just that, for a few seconds.',
      speakSeconds: 10,
      silenceSeconds: 15,
    },
    {
      text: 'Shoulders loose, head level, gaze on the horizon, jaw unclenched, breathing slow.',
      speakSeconds: 18,
      silenceSeconds: 12,
    },
    {
      text: 'Say this to yourself: I do not need to impress anyone. I can take up my space. I can be imperfect and still deserve respect.',
      speakSeconds: 14,
      silenceSeconds: 11,
    },
    {
      text: 'Now walk calmly for one minute. The point is not to look confident, it is to take up space without making yourself small.',
      speakSeconds: 12,
      silenceSeconds: 58,
    },
  ],
};

/** The small social challenge — 7 minutes, 420 s. With time to actually do it. */
export const microDefiSocial: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Choose one small social act that is slightly uncomfortable: saying hello, asking a question, thanking somebody, giving your opinion. Something doable in the next few minutes.',
      speakSeconds: 20,
      silenceSeconds: 25,
    },
    {
      text: 'Before you do it, rate your discomfort from zero to ten. Remember the number.',
      speakSeconds: 12,
      silenceSeconds: 18,
    },
    {
      text: 'Go on. I will say nothing for three minutes. Do not try to analyse it while you are doing it.',
      speakSeconds: 14,
      silenceSeconds: 166,
    },
    {
      text: 'Done. Rate your discomfort now, on the same scale.',
      speakSeconds: 14,
      silenceSeconds: 46,
    },
    {
      text: 'What did you think was going to happen? And what actually happened?',
      speakSeconds: 16,
      silenceSeconds: 44,
    },
    {
      text: 'Every small challenge builds up real evidence. That holds better than any pep talk.',
      speakSeconds: 15,
      silenceSeconds: 30,
    },
  ],
};

/** The proof of three wins — 4 minutes, 240 s. */
export const preuveDesTroisVictoires: ProgramContent = {
  type: 'narrated',
  blocks: [
    {
      text: 'Three wins from today. However tiny — especially the tiny ones.',
      speakSeconds: 14,
      silenceSeconds: 16,
    },
    {
      text: 'An easy win first: something you simply managed to do.',
      speakSeconds: 12,
      silenceSeconds: 28,
    },
    {
      text: 'A hard win: something that cost you an effort, nerves and all.',
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: 'An invisible win: something nobody noticed. Staying calm when you wanted to leave, for instance.',
      speakSeconds: 16,
      silenceSeconds: 29,
    },
    {
      text: 'What did you learn about yourself today? One sentence is enough.',
      speakSeconds: 14,
      silenceSeconds: 31,
    },
    {
      text: 'Repeated, that becomes evidence. Not a pep talk: evidence.',
      speakSeconds: 15,
      silenceSeconds: 20,
    },
  ],
};
