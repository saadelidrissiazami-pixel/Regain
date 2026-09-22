import { router, type Href } from 'expo-router';

/**
 * Revient à l'écran précédent, ou rejoint `fallback` s'il n'y en a pas.
 *
 * Un écran atteint depuis une notification, un lien ou un rappel est le premier de la pile :
 * `router.back()` n'y fait rien du tout, et le bouton « retour » reste sans effet sous le doigt,
 * sans rien afficher. Le repli choisit alors l'onglet dont l'écran dépend.
 */
export function goBack(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
