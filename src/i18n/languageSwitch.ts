/**
 * The one prompt that is deliberately not translated: the offer to change the language.
 *
 * It is written in the language being switched *to*, because the person reading it is choosing
 * that language — asking in English whether to switch to French is the wrong way round. Both
 * wordings therefore sit side by side here, like the activity steps and the exercise cues, and
 * this file is excluded from the check that keeps French out of the code.
 */
import type { Lang } from '../lib/i18n';

/** A language is named in its own language, everywhere — so this never goes through t(). */
export const LANGUAGE_NAME: Record<Lang, string> = { fr: 'Français', en: 'English' };

type Prompt = { title: string; body: string; confirm: string; cancel: string };

export const SWITCH_PROMPT: Record<Lang, Prompt> = {
  fr: {
    title: 'Passer en français ?',
    body: 'Ferme puis rouvre Regain pour que le changement prenne effet.',
    confirm: 'Passer en français',
    cancel: 'Annuler',
  },
  en: {
    title: 'Switch to English?',
    body: 'Close Regain and open it again for this to take effect.',
    confirm: 'Switch to English',
    cancel: 'Cancel',
  },
};
