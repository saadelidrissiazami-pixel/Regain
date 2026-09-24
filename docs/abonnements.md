# Premium subscriptions — getting set up

The code is ready: the paywall ([app/paywall/index.tsx](../app/paywall/index.tsx)), the purchase
logic ([src/lib/purchases.ts](../src/lib/purchases.ts)) and the identifiers
([src/config/subscriptions.ts](../src/config/subscriptions.ts)). What is left is creating the
accounts and the products, which only you can do. The identifiers below have to be copied
**exactly** everywhere.

| Thing | Identifier |
|---|---|
| RevenueCat entitlement | `premium` |
| RevenueCat offering | `default` (marked *Current*) |
| Monthly subscription | `regain_premium_monthly` |
| Yearly subscription | `regain_premium_annual` |
| iOS bundle / Android package | `com.saadelidrissiazami.regain` |

> In-app purchases work **neither in Expo Go nor on the web**: a development build is required.
> In Expo Go the Premium screen explains this, and Premium stays unlocked for testing.

## Step 1 — Test it right away, with no Apple or Google account (free)

RevenueCat provides a **Test Store**: fake purchases, but a real end-to-end flow.

1. ~~Create an account on [revenuecat.com](https://www.revenuecat.com) and a “Regain” project.~~ **Done**
2. ~~*Product catalog → Entitlements*: `premium`.~~ **Done**
3. ~~*Product catalog → Products* (Test Store): `regain_premium_monthly` (9.99) and
   `regain_premium_annual` (49.99, a 3-day trial), attached to `premium`.~~ **Done**
4. ~~*Product catalog → Offerings*: `default`, with the `$rc_monthly` and `$rc_annual` packages.~~ **Done**
5. *Apps*: copy the Test Store key into `.env`:
   `EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY=...`

> The project RevenueCat creates comes with a demonstration catalogue (`regain_pro`,
> `monthly`/`yearly`/`lifetime`) that should not be confused with ours. Only the `premium`
> entitlement unlocks the app; the Test Store's prices are in dollars, the App Store's will be in
> euros.
>
> **The test product keeps a one-week trial**, while the App Store is set to 3 days: a Test Store
> product's price and trial cannot be changed after creation, and recreating it would break its
> links to the offering and the entitlement. This has no effect on the code, which reads the
> length from the store — but in development the screen says 7 days, not 3. Check it in the
> TestFlight sandbox, the only place the real length shows.
6. Start a development build:
   - the iOS simulator (Xcode required, no paid Apple account): `npx expo run:ios`;
   - or an Android emulator / phone: `npx expo run:android`;
   - or through EAS: `npx eas-cli@latest build --profile development --platform ios|android`.

On the paywall a “Test mode” banner appears and buying opens a simulation window (success,
failure, cancellation). The Test Store key is only read in development: **never put it in the
production environment** (Apple rejects apps configured with it).

## Step 2 — Real iOS subscriptions (Apple Developer, $99/year)

1. App Store Connect → *Agreements, Tax, and Banking*: sign the **Paid Apps** agreement and fill
   in the banking and tax details (without them, no product loads).
2. Create the app `com.saadelidrissiazami.regain`, then *Subscriptions* → a “Regain Premium” group
   with the two products above (price, duration, and optionally a free trial: the paywall shows it
   automatically).
3. *Users and Access → Integrations → In-App Purchase*: generate a key (.p8) and upload it to
   RevenueCat (*Apps & providers → App Store*).
4. Attach the App Store products to the `premium` entitlement and the `default` offering.
5. Copy the iOS public key (`appl_…`) into `EXPO_PUBLIC_REVENUECAT_IOS_KEY`.

## Step 3 — Real Android subscriptions (Google Play Console, $25 once)

1. Create the app `com.saadelidrissiazami.regain` and publish a first build to an internal test
   track (Google only shows subscriptions after a first upload).
2. *Monetise → Subscriptions*: create the two products, each with one base plan.
3. Create a Google Cloud service account with access to the Play Console and upload its JSON to
   RevenueCat (*Apps & providers → Play Store*).
4. Attach the products to `premium` / `default`, then copy the public key (`goog_…`) into
   `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.

## Step 4 — Environment variables for EAS builds

EAS Build **does not read** your `.env` file (it is not uploaded). Declare the variables on
[expo.dev](https://expo.dev) → project → *Environment variables*, for each environment
(`development`, `preview`, `production` — already wired to the profiles in [eas.json](../eas.json)):

- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (without them the app does not start);
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`;
- `EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_PRIVACY_URL`;
- `EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY`: in `development` **only**.

## Before submitting — what Apple and Google check

- [x] Price, duration, automatic renewal and the trial shown on the paywall
- [x] A “Restore purchases” button
- [x] A “Manage my subscription” link (Profile)
- [ ] Terms and privacy links set (`EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_PRIVACY_URL`) — these now
      point at the English pages, see [app-store.md](app-store.md)
- [ ] A purchase tested in the sandbox (an App Store Connect tester / a Google Play licence tester)
- [ ] A demo account given to the reviewers in App Store Connect

## Later — checking on the server

Today Premium is checked inside the app (RevenueCat). To protect the data on the Supabase side as
well, the next step is a RevenueCat webhook to an Edge Function that keeps a `subscriptions` table
up to date, read by the RLS policies of the Premium tables.
