import type { ProgramContent } from '../../src/features/wellbeing/types';

export const respirationExpress: ProgramContent = {
  type: 'breathing',
  cycles: 3,
  phases: [
    { label: 'Inspirez profondément par le nez', seconds: 4 },
    { label: 'Expirez lentement par la bouche', seconds: 6 },
  ],
};

export const respiration478: ProgramContent = {
  type: 'breathing',
  cycles: 4,
  phases: [
    { label: 'Inspirez par le nez', seconds: 4 },
    { label: 'Retenez votre respiration', seconds: 7 },
    { label: 'Expirez lentement par la bouche', seconds: 8 },
  ],
};

export const coherenceCardiaque: ProgramContent = {
  type: 'breathing',
  cycles: 30,
  phases: [
    { label: 'Inspirez', seconds: 5 },
    { label: 'Expirez', seconds: 5 },
  ],
};
