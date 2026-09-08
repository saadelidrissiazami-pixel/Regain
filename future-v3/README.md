# V3 — mis de côté pour l'instant

## Coach IA conversationnel

`coach.tsx` est l'écran de chat complet (déjà fonctionnel côté code), retiré de la navigation
le temps de configurer l'infrastructure nécessaire.

Pour le réactiver :
1. Déplacer ce fichier vers `app/(tabs)/coach.tsx`.
2. Ré-ajouter l'entrée `<Tabs.Screen name="coach" .../>` dans `app/(tabs)/_layout.tsx` (voir
   l'historique git pour récupérer le bloc exact).
3. Retirer `"future-v3"` du tableau `exclude` de `tsconfig.json`.
4. Suivre la section « Coach IA conversationnel » du README principal pour déployer la
   fonction serveur (compte Anthropic + `supabase functions deploy coach`).

Le reste de l'infrastructure (`src/lib/coach.ts`, `supabase/functions/coach/`, la table
`coach_messages`) est déjà en place et n'a pas besoin d'être touché.
