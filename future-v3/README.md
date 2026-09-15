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

## Coach forme IA (programmes générés par Claude + chat)

Le coach forme tourne aujourd'hui avec un générateur par règles, gratuit et sans IA
(`src/features/fitness/planGenerator.ts`). La version IA est prête à côté :

- `supabase/functions/fitness-coach/` : Edge Function (programme, ajustement hebdo, chat) ;
- `fitnessAi.ts` : client de cette fonction (`requestFitnessPlan`, `sendFitnessChatMessage`) ;
- `fitness-chat.tsx` : écran de chat.

Pour la réactiver :
1. Créer une clé API sur console.anthropic.com, puis
   `npx supabase secrets set ANTHROPIC_API_KEY=...` et `npx supabase functions deploy fitness-coach`.
2. Déplacer `fitnessAi.ts` vers `src/lib/` et `fitness-chat.tsx` vers `app/fitness/chat.tsx`,
   en corrigeant les chemins d'import.
3. Dans `app/(tabs)/fitness.tsx` et `app/fitness/checkin.tsx`, remplacer `createFitnessPlan`
   par `requestFitnessPlan('generate_plan' | 'adjust_plan', targets)`, et remettre le lien
   « Parler à mon coach » vers `/fitness/chat`.

Les cibles caloriques restent calculées en code dans les deux versions : l'IA ne les fixe jamais.
