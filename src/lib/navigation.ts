import { router, type Href } from 'expo-router';

/**
 * Goes back to the previous screen, or to `fallback` when there is none.
 *
 * A screen reached from a notification, a link or a reminder is the first on the stack, so
 * `router.back()` does nothing at all there, and the back button stays dead under the finger,
 * showing nothing. The fallback then picks the tab the screen belongs to.
 */
export function goBack(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
