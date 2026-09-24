import { router, type Href } from 'expo-router';

/**
 * Goes back to the previous screen, or to `fallback` when there is none.
 *
 * A screen reached from a notification, a link or a reminder is the first on the stack, so
 * `router.back()` n'y fait rien du tout, et le bouton « retour » reste sans effet sous le doigt,
 * showing nothing. The fallback then picks the tab the screen belongs to.
 */
export function goBack(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
