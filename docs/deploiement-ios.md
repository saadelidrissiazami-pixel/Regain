# Publishing Regain on the App Store

The run-through, in order. The steps marked **(you)** need your credentials or your bank details:
I cannot do them for you, and I must never enter that information. Everything else is already done
in the code.

Budget: **$99 a year** for the Apple Developer account. The Expo account is free.

---

## 1. An Apple Developer account **(you)** — done on 20 September 2026

1. [developer.apple.com/programs](https://developer.apple.com/programs/) → *Enroll*.
2. As an individual, no D-U-N-S number is asked for; as a company, that number is required and it
   takes a few days.
3. Turn two-factor authentication on for your Apple ID: it is mandatory.

The **free apps agreement** is active as soon as the account is approved. The paid agreement is
signed by hand (step 3).

## 2. Trader status (DSA) **(you)**

*Business → Agreements → “Complete compliance requirements”.*

Under the European Digital Services Act, Apple has to publish the contact details of any seller
distributing in the EU. **Without this status, no app and no update can be submitted for the
European Union**, and apps already live are pulled from it. You declare an address, a phone number
and an email, all of which will be visible on the App Store listing.

While you are there: *Edit legal entity*, which is required before the paid agreement can be
signed.

## 3. Getting paid **(you)**

Apple takes the subscription payments and passes the money on to you. None of it goes through the
app: your bank details stay with Apple.

1. **Agreements, Tax, and Banking** → sign the **Paid Apps** agreement.
2. **Bank details**: add an account in your own name (IBAN). An account in somebody else's name
   blocks the payouts.
3. **Tax details**: the French form, plus the US W-8BEN form that is offered automatically.
4. **[App Store Small Business Program](https://developer.apple.com/app-store/small-business-program/)**:
   sign up. The commission drops from 30% to **15%** for as long as you earn under a million
   dollars a year. It is a single checkbox, and plenty of people forget it.
5. Payouts arrive about 45 days after the end of the month concerned.

## 4. The app and the two subscriptions **(you)**

The app itself first: [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → *Apps* → **+**.

| Field | Value |
|---|---|
| Name | Regain |
| Primary language | English (U.S.) |
| Bundle identifier | `com.saadelidrissiazami.regain` |
| SKU | `regain-ios` |

> The app was created with French as its primary language. From 1.2 the app is in English, so that
> setting has to be changed on the app record — the listing's language alone is not enough.

The bundle identifier only appears in the list once it has been registered: let `eas build` create
it (step 9), or declare it in *Certificates, Identifiers & Profiles → Identifiers*.

Then, under *Monetisation → Subscriptions*, create the **Regain Premium** group, and in it:

| Product | Identifier | Price | Offer |
|---|---|---|---|
| Yearly | `regain_premium_annual` | €49.99 | a 3-day free trial |
| Monthly | `regain_premium_monthly` | €9.99 | none |

These identifiers have to be **exactly** those: the code relies on them
([src/config/subscriptions.ts](../src/config/subscriptions.ts)).

For each product: a display name, a description, and a screenshot of the app's subscription screen
(Apple requires it for review). If those display names were entered in French, change them too.

## 5. RevenueCat **(you)**

The full detail is in [docs/abonnements.md](abonnements.md). In short:

1. ~~A “Regain” project, the `premium` entitlement, both products, the `default` offering.~~ **Done**,
   and the whole flow (trial, purchase, unlock) has been checked against the Test Store.
2. *Apps & providers → App Store*: add `com.saadelidrissiazami.regain`, then upload the in-app
   purchase key (the `.p8` file generated in App Store Connect → *Users and Access → Integrations*).
3. Attach the **App Store** products to the `premium` entitlement and the `default` offering,
   alongside the Test Store ones.
4. Copy the iOS public key (`appl_…`): that is `EXPO_PUBLIC_REVENUECAT_IOS_KEY`.

The `.p8` key can be downloaded **only once**: keep it in your password manager. Lost, it has to be
regenerated.

## 6. The legal pages **(you)**

Apple requires a publicly reachable privacy policy, and a link to your terms on the subscription
screen. Both texts are written and waiting:

- [docs/legal/privacy-policy.md](legal/privacy-policy.md)
- [docs/legal/terms-of-use.md](legal/terms-of-use.md)

**This is done**: the site is published by GitHub Pages from `main` / `docs`.

- Terms of use: <https://saadelidrissiazami-pixel.github.io/Regain/legal/terms-of-use>
- Privacy policy: <https://saadelidrissiazami-pixel.github.io/Regain/legal/privacy-policy>

The French pages stay published for the versions already installed:

- <https://saadelidrissiazami-pixel.github.io/Regain/legal/conditions-utilisation>
- <https://saadelidrissiazami-pixel.github.io/Regain/legal/politique-de-confidentialite>

Both English addresses go into the variables below, and the second goes into App Store Connect.

## 7. The environment variables

EAS does not read your `.env` file: the variables live on the server, per environment.

| Variable | Value | State |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | your Supabase project's address | ✅ `production` + `preview` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | the Supabase public key | ✅ `production` + `preview` |
| `EXPO_PUBLIC_TERMS_URL` | the terms' address | ⚠️ set, but still pointing at the French page |
| `EXPO_PUBLIC_PRIVACY_URL` | the privacy policy's address | ⚠️ set, but still pointing at the French page |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | the `appl_…` key | ❌ depends on step 5 |

The first four are public by construction: the `EXPO_PUBLIC_` prefix writes them into the shipped
bundle, so they are readable in the app either way. Set them like this:

```bash
npx eas-cli@latest env:set --name NAME --value "value" --environment production --visibility plaintext
```

**Never** put `EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY` or `EXPO_PUBLIC_SIMULATE_FREE` in production.
An automatic check refuses the build if you do:

```bash
npm run preflight -- production
```

## 8. Preparing the database **(you)**

1. Apply any missing migrations in Supabase's *SQL Editor*, in order (see
   [supabase/migrations](../supabase/migrations)).
2. Under *Authentication → Providers → Email*, **turn “Confirm email” back on**: it was switched
   off for testing.
3. Deploy the account-deletion function: `npx supabase functions deploy delete-account`.
   Without it, the “Delete my account” button fails, and Apple has been checking this since 2022.
   **Done** on 20 September 2026, from the dashboard's editor.

## 8b. Switching the AI coach on **(you)**

The conversational coach is for subscribers only and capped on the server (30 messages an hour,
**20 a day**): without that cap, a single account can run up the bill.

1. Create a key on [console.anthropic.com](https://console.anthropic.com), then:
   `npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`
2. `npx supabase functions deploy coach`
3. Check it in the app: without a subscription the entry point leads to the paywall; with one, a
   question gets an answer.

With no key and no deployment the app is still whole: the screen shows its unavailable message and
everything else — the plan, the sessions, the programme, the meals, the shopping — carries on,
since none of that uses AI.

**The privacy policy was updated accordingly** (Anthropic added to the processors): republish the
pages before submitting, or the page online is wrong.

The two coach prompts now instruct English. They run on the server, so deploying them changes what
every installed build sees at once — they should go out with the English release, not before it.

## 9. Building and submitting

The package is called `eas-cli` (not `eas`): `npx eas login` fails with “could not determine
executable to run”. To avoid re-downloading it on every command: `npm install -g eas-cli`, then use
`eas` in place of `npx eas-cli@latest`.

```bash
npx eas-cli@latest login
```

```bash
npx eas-cli@latest init
```

```bash
npx eas-cli@latest build --platform ios --profile production
```

```bash
npx eas-cli@latest submit --platform ios --latest
```

EAS creates and keeps the certificates and the distribution profile: there is nothing to generate
in Xcode. The first build asks for your Apple ID.

## 10. Testing purchases before release **(you)**

1. App Store Connect → *Users and Access → Sandbox Testers*: create a test account with an email
   address you do not already use with Apple.
2. On the iPhone: *Settings → App Store → Sandbox Account*, sign that account in.
3. Install the TestFlight version and subscribe: the purchase is simulated, nothing is charged, and
   a 3-day trial lasts about a minute in the sandbox.
4. Check the trial, restoring a purchase, and the “Manage my subscription” link.

## 11. The listing and the review

Text, keywords, notes for the review team and the answers to the privacy questionnaire:
[docs/app-store.md](app-store.md).

Things that fail a review, already handled in the app:
- price, duration and renewal shown on the subscription screen;
- a “Restore purchases” button;
- links to the terms and the privacy policy;
- deleting the account from inside the app.

Still for you to provide: **a demo account** (the email and password of a Regain account filled with
examples) in the review notes, or the app comes straight back.

The address used is an **alias** of the personal mailbox: `+demo` makes it a separate account as far
as Supabase is concerned, while Gmail delivers the mail to the same inbox. The personal data stays
untouched, and the review team never sees the everyday account.

Choose a password, then run the command **replacing `your-password`** with it:

```bash
DEMO_EMAIL=saadelidrissiazami+demo@gmail.com DEMO_PASSWORD='your-password' node scripts/seed-demo.mjs
```

On the first call the account does not exist: Supabase creates it and sends a confirmation link.
Open it in the mailbox, then **run the same command again** — this time it signs in and fills the
account.

The script signs in as that account and gives it availability, a plan with two activities ticked
off, energy check-ins, four wellbeing sessions with ratings and answers, and a fitness profile. Your
password never leaves your terminal. Finish in the app with *Fitness → Build my programme*.

**The script first erases the account's availability slots, energy check-ins and finished
sessions** before writing its own — that is the reason for the alias: run against the personal
account, it would make that data disappear.

## 12. After release

- Keep an eye on RevenueCat: trials started, conversions, cancellations.
- Turn **grace period** on in RevenueCat: it catches failed payments, which account for close to a
  third of cancellations on Android.
- For an update: `npx eas-cli@latest build --platform ios --profile production` then
  `npx eas-cli@latest submit`. The build number climbs on its own.
