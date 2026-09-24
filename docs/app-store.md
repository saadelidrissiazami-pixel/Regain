# Regain's App Store listing

Text ready to paste into App Store Connect. Apple's character limits are respected.

> **The listing's language changed with 1.2.** The app is now in English, and
> [eas.json](../eas.json) submits with `"language": "en-US"`. App Store Connect keeps the app's
> **primary language** as a separate setting on the app record itself: it has to be switched to
> English there, or the English listing will sit underneath a French primary. The French text of
> this file is in the history, at the 1.1 tag, if a French localisation is ever added back.

## Identity

| Field | Value | Limit |
|---|---|---|
| Name | `Regain — Routine & Wellbeing` | 30 |
| Subtitle | `Routine, wellbeing, fitness` | 30 |
| Primary category | Health & Fitness | — |
| Secondary category | Lifestyle | — |
| Age rating | 4+ | — |
| Bundle identifier | `com.saadelidrissiazami.regain` | — |
| Apple ID for the app | `6814269226` | — |

> “Regain” on its own was already taken by another app: a listing's name has to be unique across
> the whole App Store. Under the icon the app stays **Regain** (`name` in
> [app.json](../app.json)), and that is also the name shown in Apple's subscription settings.

## Subscriptions already created

| Product | Identifier | Price | Offer | Apple ID |
|---|---|---|---|---|
| Yearly | `regain_premium_annual` | €49.99 | 3 days free, no end date | `6814269327` |
| Monthly | `regain_premium_monthly` | €9.99 | none | `6814271015` |

Group **Regain Premium** (`22400015`), shown as “Regain” in Apple's settings. Prices for the other
174 countries were worked out by Apple from the euro price. Both products are set to “Submit with
the app”: they go out with the first version, and each one needs a screenshot of the subscription
screen for review.

The display names of the two products and of the group live in App Store Connect, not in this
repository — if they were entered in French, they need changing there too.

## Promotional text (editable without a new version, 170 characters)

```
A realistic weekly plan, guided sessions and a fitness coach. Regain starts from the energy you
have today, not from an ideal.
```

## Description

```
Regain helps you rebuild a routine that holds, without the guilt.

YOUR WEEK, AT YOUR PACE
Tell Regain when you are free and how you feel. It places activities into the time you have, at the
right hour, around the energy you actually have today. One activity at a time, never an
overwhelming list.

GUIDED WELLBEING SESSIONS
Breathing, meditation, journaling, confidence, sleep, and quiet sessions you can do in public. One
to nine minutes. Optional voice guidance, background music written for the app, and a ten-second
countdown to settle in.

A JOURNAL THAT WATCHES YOU GET ON
At the end of each session, note how you feel and answer two questions written for that session.
It all reads back in your journal, and your tracking shows how your ratings move over time.

YOUR FITNESS COACH (PREMIUM)
A strength programme at your level and with your equipment, meals matched to your calorie needs, a
shopping list ready to go, and a weekly check-in that eases off or steps up the week after. Your
allergies and any joint trouble are respected.

FREE, GENUINELY
The plan, the tracking, the journal and eighteen wellbeing sessions stay free, with no time limit.

REGAIN PREMIUM
€49.99/year with a 3-day free trial, or €9.99/month. The subscription renews automatically unless
it is cancelled at least 24 hours before the end of the period. Cancel any time from your App Store
account settings.

Regain does not diagnose anything and is no substitute for a health professional.
```

## Keywords (100 characters, comma-separated, no spaces)

```
routine,habits,wellbeing,meditation,breathing,sleep,strength,planner,energy,journal,anxiety,burnout
```

## Addresses

| Field | Value |
|---|---|
| Support URL | `https://saadelidrissiazami-pixel.github.io/Regain/` |
| Marketing URL | optional |
| Privacy policy | `https://saadelidrissiazami-pixel.github.io/Regain/legal/privacy-policy` |

The English legal pages are new ([privacy-policy.md](legal/privacy-policy.md),
[terms-of-use.md](legal/terms-of-use.md)); the French ones stay published for the versions already
installed. The two links the subscription screen shows come from EAS environment variables, so they
have to be repointed for `production` and `preview`:

```bash
npx eas-cli@latest env:create --name EXPO_PUBLIC_PRIVACY_URL --value https://saadelidrissiazami-pixel.github.io/Regain/legal/privacy-policy --environment production --environment preview --visibility plaintext --force
```

```bash
npx eas-cli@latest env:create --name EXPO_PUBLIC_TERMS_URL --value https://saadelidrissiazami-pixel.github.io/Regain/legal/terms-of-use --environment production --environment preview --visibility plaintext --force
```

Without that, the paywall keeps linking to the French pages — which still works, but an English
listing pointing at a French policy is worth avoiding.

## Screenshots

Required: iPhone 6.9 inch (1320 × 2868). Apple derives the other sizes.
Take them on a demo account, never on your personal one:

```bash
xcrun simctl boot "iPhone 18 Pro Max"
```

```bash
xcrun simctl io booted screenshot ~/Desktop/regain-1.png
```

Suggested order: Plan (the “Up next” card), a wellbeing session under way, the journal and its
ratings, the fitness coach (programme), the subscription screen.

**The screenshots from 1.1 are in French and cannot be reused.** They have to be retaken on the
English build.

## Notes for the review team

```
Demo account:
  email: saadelidrissiazami+demo@gmail.com
  password: [the one chosen when filling this in — never written here]

This account already has free times, a plan, finished sessions and a fitness programme, so
everything is visible straight away.

Subscription: the “Fitness” tab and any session marked with a padlock open the subscription screen
(3-day free trial, then €49.99/year, or €9.99/month). “Restore purchases” is on that same screen,
and “Manage my subscription” is in the Profile tab.

Deleting the account: Profile tab → “My data” → “Delete permanently”. Erasure is immediate.

Location: only asked for if the user opens a walking activity, in order to draw a route. It is not
stored.
```

## The “App Privacy” questionnaire

| Data | Collected | Linked to identity | Used for tracking | Purpose |
|---|---|---|---|---|
| Email address | yes | yes | no | App functionality |
| Health & fitness (weight, height, goals, allergies, health notes) | yes | yes | no | App functionality |
| User content (notes, ratings, answers, messages to the coach) | yes | yes | no | App functionality |
| User ID | yes | yes | no | App functionality |
| Purchases | yes | yes | no | App functionality |
| Precise location | yes | no | no | App functionality |
| Usage data, contacts, photos, browsing history | no | — | — | — |

Answers to the other questions: no advertising, no third-party analytics, no tracking across apps
(so no App Tracking Transparency prompt).

Messages written to the Premium coach are sent to **Anthropic** to produce the reply: to be
declared as a processor, and mentioned in the privacy policy. The rest of the app — the plan, the
sessions, the programme, the meals, the shopping — is computed on the device, with no AI.

## Export compliance

Already declared in `app.json` (`usesNonExemptEncryption: false`): the app uses only iOS's standard
encryption and HTTPS. Apple will not ask again on each submission.
