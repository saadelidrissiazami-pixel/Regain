# App Store screenshots

Taken on the English build (1.2), on the demo account, in the iPhone 18 Pro Max simulator.

`ios-6.9/` holds the only size Apple needs — **1320 × 2868**, the 6.9 inch iPhone. Every other
size is derived from it, so there is nothing else to produce.

| File | Screen |
|---|---|
| `regain-1-plan.png` | The week's plan and the next activity |
| `regain-2-session.png` | A breathing session under way |
| `regain-3-programme.png` | The strength programme |
| `regain-4-journal.png` | The wellbeing journal and its ratings |

## The subscription screen is missing, on purpose

Apple asks for a screenshot of the subscription screen for **each** of the two products, and it
cannot be taken here: the paywall shows a “RevenueCat test mode” badge whenever `__DEV__` is true,
and the prices come from the Test Store rather than App Store Connect. It has to be taken from a
TestFlight build, where the badge is gone and the real prices appear.

## Retaking them

Re-seed the demo account first, or the screenshots will show whatever state the last session left
behind — the Plan screen in particular changes with the energy check-in and the week's activities.

```bash
xcrun simctl io booted screenshot store/screenshots/ios-6.9/regain-1-plan.png
```

The 1.1 screenshots were in French and were not reusable; these replace them.
