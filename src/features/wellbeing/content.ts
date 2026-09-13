import { respirationExpress, respiration478, coherenceCardiaque } from '../../../content/breathing';
import { pauseUneMinute, ancrageMatin, meditationSoir } from '../../../content/meditation';
import { gratitudeExpress, clarifierJournee, viderSaTete } from '../../../content/journaling';
import { troisQualites, seRappelerReussite, preparationMomentDifficile } from '../../../content/confidence';
import { ralentirAvantDormir, relacherTensions, scanCorporelComplet } from '../../../content/sleep';
import { ancrageRapide, detachementRegardAutres, respirerDansLaFoule } from '../../../content/in-public';
import type { ProgramContent } from './types';

export const CONTENT_BY_SLUG: Record<string, ProgramContent> = {
  'respiration-express': respirationExpress,
  'respiration-4-7-8': respiration478,
  'coherence-cardiaque': coherenceCardiaque,

  'meditation-pause-1min': pauseUneMinute,
  'meditation-matin': ancrageMatin,
  'meditation-soir': meditationSoir,

  'journaling-gratitude-express': gratitudeExpress,
  'journaling-clarifier': clarifierJournee,
  'journaling-vider-tete': viderSaTete,

  'confiance-trois-qualites': troisQualites,
  'confiance-reussite': seRappelerReussite,
  'confiance-preparation': preparationMomentDifficile,

  'sommeil-ralentir': ralentirAvantDormir,
  'sommeil-relacher': relacherTensions,
  'sommeil-scan-corporel': scanCorporelComplet,

  'public-ancrage-rapide': ancrageRapide,
  'detachement-regard-autres': detachementRegardAutres,
  'public-respirer-foule': respirerDansLaFoule,
};
