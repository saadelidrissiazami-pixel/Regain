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
import {
  meditationJour1, meditationJour2, meditationJour3, meditationJour4, meditationJour5,
  meditationJour6, meditationJour7, meditationJour8, meditationJour9, meditationJour10,
} from '../../../content/courses/meditation';
import {
  sommeilJour1, sommeilJour2, sommeilJour3, sommeilJour4, sommeilJour5,
  sommeilJour6, sommeilJour7, sommeilJour8, sommeilJour9, sommeilJour10,
} from '../../../content/courses/sommeil';
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

  'parcours-meditation-j1': meditationJour1,
  'parcours-meditation-j2': meditationJour2,
  'parcours-meditation-j3': meditationJour3,
  'parcours-meditation-j4': meditationJour4,
  'parcours-meditation-j5': meditationJour5,
  'parcours-meditation-j6': meditationJour6,
  'parcours-meditation-j7': meditationJour7,
  'parcours-meditation-j8': meditationJour8,
  'parcours-meditation-j9': meditationJour9,
  'parcours-meditation-j10': meditationJour10,

  'parcours-sommeil-j1': sommeilJour1,
  'parcours-sommeil-j2': sommeilJour2,
  'parcours-sommeil-j3': sommeilJour3,
  'parcours-sommeil-j4': sommeilJour4,
  'parcours-sommeil-j5': sommeilJour5,
  'parcours-sommeil-j6': sommeilJour6,
  'parcours-sommeil-j7': sommeilJour7,
  'parcours-sommeil-j8': sommeilJour8,
  'parcours-sommeil-j9': sommeilJour9,
  'parcours-sommeil-j10': sommeilJour10,
};
