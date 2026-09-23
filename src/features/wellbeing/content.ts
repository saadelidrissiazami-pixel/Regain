import {
  respirationExpress,
  respiration478,
  coherenceCardiaque,
  respiration46,
  soupirPhysiologique,
  respirationEscalier,
} from '../../../content/breathing';
import {
  pauseUneMinute,
  ancrageMatin,
  meditationSoir,
  meditationCinqSens,
  meditationObserverPensees,
  meditationScanCorporel,
} from '../../../content/meditation';
import {
  gratitudeExpress,
  clarifierJournee,
  viderSaTete,
  dechargementMental,
  journalDeConfiance,
  peurEnPlan,
} from '../../../content/journaling';
import {
  troisQualites,
  seRappelerReussite,
  preparationMomentDifficile,
  postureDePresence,
  microDefiSocial,
  preuveDesTroisVictoires,
} from '../../../content/confidence';
import {
  ralentirAvantDormir,
  relacherTensions,
  scanCorporelComplet,
  respirationEndormissement,
  cerveauEnVeille,
  voyageMentalMonotone,
} from '../../../content/sleep';
import {
  ancrageRapide,
  detachementRegardAutres,
  respirerDansLaFoule,
  sortieDeTroisMinutes,
  modeObservateur,
  boutonPause,
  kitDurgence,
} from '../../../content/in-public';
import { sosAngoisse, sosPriseDeParole, sosRuminations, sosStressTravail } from '../../../content/sos';
import type { ProgramContent } from './types';

export const CONTENT_BY_SLUG: Record<string, ProgramContent> = {
  'respiration-express': respirationExpress,
  'respiration-4-7-8': respiration478,
  'coherence-cardiaque': coherenceCardiaque,
  'respiration-4-6': respiration46,
  'respiration-soupir-physiologique': soupirPhysiologique,
  'respiration-escalier': respirationEscalier,

  'meditation-pause-1min': pauseUneMinute,
  'meditation-matin': ancrageMatin,
  'meditation-soir': meditationSoir,
  'meditation-5-sens': meditationCinqSens,
  'meditation-observer-pensees': meditationObserverPensees,
  'meditation-scan-corporel': meditationScanCorporel,

  'journaling-gratitude-express': gratitudeExpress,
  'journaling-clarifier': clarifierJournee,
  'journaling-vider-tete': viderSaTete,
  'journaling-dechargement-mental': dechargementMental,
  'journaling-confiance': journalDeConfiance,
  'journaling-peur-en-plan': peurEnPlan,

  'confiance-trois-qualites': troisQualites,
  'confiance-reussite': seRappelerReussite,
  'confiance-preparation': preparationMomentDifficile,
  'confiance-posture-presence': postureDePresence,
  'confiance-micro-defi-social': microDefiSocial,
  'confiance-trois-victoires': preuveDesTroisVictoires,

  'sommeil-ralentir': ralentirAvantDormir,
  'sommeil-relacher': relacherTensions,
  'sommeil-scan-corporel': scanCorporelComplet,
  'sommeil-respiration-endormissement': respirationEndormissement,
  'sommeil-cerveau-en-veille': cerveauEnVeille,
  'sommeil-voyage-mental': voyageMentalMonotone,

  'public-ancrage-rapide': ancrageRapide,
  'detachement-regard-autres': detachementRegardAutres,
  'public-respirer-foule': respirerDansLaFoule,
  'public-sortie-3-minutes': sortieDeTroisMinutes,
  'public-mode-observateur': modeObservateur,
  'public-bouton-pause': boutonPause,
  'public-kit-urgence': kitDurgence,

  'sos-angoisse': sosAngoisse,
  'sos-prise-de-parole': sosPriseDeParole,
  'sos-stress-travail': sosStressTravail,
  'sos-ruminations': sosRuminations,
};
