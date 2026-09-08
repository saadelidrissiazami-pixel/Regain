import { respiration478 } from '../../../content/breathing';
import { ancrageMatin } from '../../../content/meditation';
import { clarifierJournee } from '../../../content/journaling';
import { seRappelerReussite } from '../../../content/confidence';
import { relacherTensions } from '../../../content/sleep';
import { detachementRegardAutres } from '../../../content/in-public';
import type { ProgramContent } from './types';

export const CONTENT_BY_SLUG: Record<string, ProgramContent> = {
  'respiration-4-7-8': respiration478,
  'meditation-matin': ancrageMatin,
  'journaling-clarifier': clarifierJournee,
  'confiance-reussite': seRappelerReussite,
  'sommeil-relacher': relacherTensions,
  'detachement-regard-autres': detachementRegardAutres,
};
