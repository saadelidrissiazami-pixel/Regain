# Regain

A mobile planning and wellbeing app (React Native + Expo). It answers one question, over and over: *“what would be a good activity for me right now?”*

The app is in English. What is stored is not: slugs, the status and level values Postgres checks, and the category keys that identify a theme all stay as they were, because they live in rows belonging to real people. The wording a person reads comes from the bundle — `src/features/wellbeing/catalogue.ts` and `src/features/activities/catalogue.ts` — so the language of the interface follows the installed build and can never disagree with it.

## Running it locally

```bash
npm install
```

```bash
npm run ios
```

(or `npm run android` / `npm run web`)

The app does not work until `.env` is configured (see below) — it needs Supabase from the sign-in screen onwards.

## Connecting Supabase (required)

This needs an account that cannot be created for you:

1. Create a project on [supabase.com](https://supabase.com) — choose the **EU (Frankfurt)** region for GDPR.
2. In *Project Settings → API*, copy the `Project URL` and the `anon public key`.
3. Copy `.env.example` to `.env` and fill in those two values:
   ```bash
   cp .env.example .env
   ```
4. Apply **in order** every file in [`supabase/migrations/`](supabase/migrations) through the Supabase dashboard's *SQL Editor* (or `supabase db push` if you have the CLI).
5. Under **Authentication → Sign In / Providers → Email**, turn *Confirm email* off to test without a mailbox (turn it back on before going to production).

## Premium subscriptions (optional)

The paywall and the subscription logic (RevenueCat) are ready: monthly and yearly plans, a free trial, restoring, managing the subscription, and live status updates. Follow **[docs/abonnements.md](docs/abonnements.md)**: all of it can be tested for free with RevenueCat's Test Store before creating the Apple and Google accounts.

In-app purchases need a **development build** — they do not work in Expo Go or in the web preview (Premium stays unlocked there for testing).

## Calendar syncing

*Profile → Calendar* automatically adds each plan to a “Regain” calendar on the device (iCloud on iPhone where possible), at the real times you are free, with an alert 15 min beforehand (unless Regain's own reminders are already on). The “Sync with my calendar” button in the Plan tab does it on demand. Turning syncing off removes upcoming activities. Like purchases, the calendar is **not available in Expo Go**: a development build is required.

## The conversational AI coach (optional — V2)

The chat ([app/coach.tsx](app/coach.tsx)) calls a Supabase Edge Function ([supabase/functions/coach](supabase/functions/coach)), which in turn calls the Anthropic API — the API key is never exposed in the app. Without a deployment, the screen shows a clear error instead of crashing. To switch it on:

1. Create an account on [console.anthropic.com](https://console.anthropic.com) and generate an API key.
2. Install the Supabase CLI if you need to: `npm install -g supabase`.
3. `supabase login`, then `supabase link --project-ref bbxmmqmrndgcmmsdrcjg`.
4. `supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key`.
5. `supabase functions deploy coach`.

## Publishing on the App Store

The full run-through (Apple account, banking, subscriptions, variables, building, TestFlight, review): **[docs/deploiement-ios.md](docs/deploiement-ios.md)**.
The listing's text: [docs/app-store.md](docs/app-store.md).
The legal pages to publish: [docs/legal/](docs/legal).

Before any build, a check refuses an incomplete production build:

```bash
npm run preflight -- production
```

## Beta distribution (Phase 8)

1. Create an account on [expo.dev](https://expo.dev) if you do not have one, then in the project: `npx eas-cli@latest login`.
2. `npx eas-cli@latest init` to link this project to your Expo account (it adds a `projectId` to `app.json`).
3. `npx eas-cli@latest build --profile preview --platform ios` (needs an Apple Developer account, $99/year) or `--platform android` (a Google Play Console account, $25 once).
4. Distribute the build through TestFlight (iOS) or the internal test channel (Android).

The build profiles are already set up in [`eas.json`](eas.json). EAS Build does not read `.env`: declare your `EXPO_PUBLIC_*` variables on expo.dev (see [docs/abonnements.md](docs/abonnements.md)).

## Project layout

```
app/                    Expo Router routes (short files that hand off to src/screens)
  (tabs)/               Plan, Wellbeing, Fitness, Tracking, Profile
  (auth)/               Sign in
  onboarding/           Onboarding in 4 steps (first name, goals, rhythm, budget)
  planning/             Week / month, adding an activity
  fitness/              Programme, nutrition, workout player, check-in, questionnaire
  wellbeing/            The immersive session, themes, search, journal
  profile/ settings/    My goals, settings
  availability/         When you are free
  paywall/              Premium subscription
src/
  theme/                The design system: colours (light / dark), type, spacing, radii, shadows, images
  components/ui/        Primitives (Screen, ScreenHeader, Card, Button, SegmentedControl, Sheet, Tag…)
  components/cards/     Domain cards (NowCard, WorkoutHeroCard, RecommendationHero, StatCard, MoodScale…)
  components/feedback/  Empty states, errors, loading skeletons, messages
  screens/              Whole screens, by domain
  hooks/                Data shared between screens (usePlanning, useFitness, useWellbeing…)
  features/             Pure, tested logic, by domain
  lib/                  Supabase, calendar, notifications, purchases
supabase/
  migrations/            The versioned SQL schema (run in order)
  functions/coach/        The AI coach's Edge Function (a secure proxy to Anthropic)
content/                 The static wellbeing library (meditation, breathing, journaling…)
```

## Design system

- Colours: `src/theme/colors.ts` (light and dark palettes, contrasts checked in `tests/palettes.test.ts`).
  The Tailwind classes (`bg-surface`, `text-ink-2`…) read the same variables; `useTheme()` gives them in JS.
- Type: SF Pro (the system font) on iOS, Inter on Android and the web, through `<Text variant="…">`.
- A Light / Dark / Auto setting in Profile → Settings.
- Mood photography: `assets/images/` (compressed JPEGs, generated in one style), declared in
  `src/theme/images.ts`. An undeclared image falls back to a sage gradient.
- Migration `0022_coach_redesign.sql` adds usual sleep, the training slot and the training days, plus
  the log of strength sessions. Until it is applied, that information is simply hidden.

## Where the project stands

Every phase of the original MVP is implemented and tested:

- **Phases 0-1** — Foundations, accounts and onboarding
- **Phase 2** — The internal calendar (recurring and one-off availability)
- **Phase 3** — The rule engine that generates the real weekly plan
- **Phase 4** — The wellbeing library (breathing, meditation, journaling, confidence, sleep, being in public)
- **Phase 5** — Tracking wired to the activities actually done (streaks, time by category)
- **Phase 6** — The Premium paywall, in code — needs your RevenueCat / App Store / Play Store accounts
- **Phase 7** — Daily reminders, pull to refresh
- **Phase 8** — The EAS configuration — needs your Expo account to build and distribute

V2 features, beyond the original MVP:

- **Learned personalisation** — the rule engine gradually favours the categories you complete most
- **Calendar syncing** — exporting the plan to the device's own calendar (iOS/Android)
- **The conversational AI coach** — in code — needs your Anthropic account plus the Edge Function deployed
- **Self-running narrated sessions** — 61 sessions whose stated duration is a calculation, not a promise
- **Ten-day courses** — two of them, which teach a technique rather than offering isolated sessions
- **SOS sessions** — four two-minute sessions, free by nature, for the moment things are bad

What is left depends only on external accounts you have to create yourself (see the sections above).
