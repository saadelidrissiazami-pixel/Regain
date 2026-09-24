import * as en_breathing from '../../../content/breathing';
import * as fr_breathing from '../../../content/fr/breathing';
import * as en_meditation from '../../../content/meditation';
import * as fr_meditation from '../../../content/fr/meditation';
import * as en_journaling from '../../../content/journaling';
import * as fr_journaling from '../../../content/fr/journaling';
import * as en_confidence from '../../../content/confidence';
import * as fr_confidence from '../../../content/fr/confidence';
import * as en_sleep from '../../../content/sleep';
import * as fr_sleep from '../../../content/fr/sleep';
import * as en_in_public from '../../../content/in-public';
import * as fr_in_public from '../../../content/fr/in-public';
import * as en_courses_meditation from '../../../content/courses/meditation';
import * as fr_courses_meditation from '../../../content/fr/courses/meditation';
import * as en_courses_sommeil from '../../../content/courses/sommeil';
import * as fr_courses_sommeil from '../../../content/fr/courses/sommeil';
import * as en_sos from '../../../content/sos';
import * as fr_sos from '../../../content/fr/sos';

import { lang } from '../../lib/i18n';
import type { ProgramContent } from './types';

// Every session exists twice, content/ in English and content/fr/ in French, with the same names.
const pick = <T,>(en: T, fr: T): T => (lang === 'fr' ? fr : en);

const {
  respirationExpress,
  respiration478,
  coherenceCardiaque,
  respiration46,
  soupirPhysiologique,
  respirationEscalier,
} = pick(en_breathing, fr_breathing);
const {
  pauseUneMinute,
  ancrageMatin,
  meditationSoir,
  meditationCinqSens,
  meditationObserverPensees,
  meditationScanCorporel,
} = pick(en_meditation, fr_meditation);
const {
  gratitudeExpress,
  clarifierJournee,
  viderSaTete,
  dechargementMental,
  journalDeConfiance,
  peurEnPlan,
} = pick(en_journaling, fr_journaling);
const {
  troisQualites,
  seRappelerReussite,
  preparationMomentDifficile,
  postureDePresence,
  microDefiSocial,
  preuveDesTroisVictoires,
} = pick(en_confidence, fr_confidence);
const {
  ralentirAvantDormir,
  relacherTensions,
  scanCorporelComplet,
  respirationEndormissement,
  cerveauEnVeille,
  voyageMentalMonotone,
} = pick(en_sleep, fr_sleep);
const {
  ancrageRapide,
  detachementRegardAutres,
  respirerDansLaFoule,
  sortieDeTroisMinutes,
  modeObservateur,
  boutonPause,
  kitDurgence,
} = pick(en_in_public, fr_in_public);
const {
  meditationJour1, meditationJour2, meditationJour3, meditationJour4, meditationJour5,
  meditationJour6, meditationJour7, meditationJour8, meditationJour9, meditationJour10,
} = pick(en_courses_meditation, fr_courses_meditation);
const {
  sommeilJour1, sommeilJour2, sommeilJour3, sommeilJour4, sommeilJour5,
  sommeilJour6, sommeilJour7, sommeilJour8, sommeilJour9, sommeilJour10,
} = pick(en_courses_sommeil, fr_courses_sommeil);
const { sosAngoisse, sosPriseDeParole, sosRuminations, sosStressTravail } = pick(en_sos, fr_sos);

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
