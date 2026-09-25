import { t } from '../../lib/i18n';

// Formatting RevenueCat's offers for the paywall. Structural types (compatible with
// PurchasesPackage) so it stays testable without loading the native module.

export type IntroPriceLike = {
  price: number;
  priceString: string;
  cycles: number;
  periodUnit: string; // "DAY" | "WEEK" | "MONTH" | "YEAR"
  periodNumberOfUnits: number;
};

export type PackageLike = {
  identifier: string;
  packageType: string; // PACKAGE_TYPE
  product: {
    price: number;
    priceString: string;
    pricePerMonthString: string | null;
    introPrice: IntroPriceLike | null;
  };
};

const ORDER = ['ANNUAL', 'SIX_MONTH', 'THREE_MONTH', 'TWO_MONTH', 'MONTHLY', 'WEEKLY', 'LIFETIME'];

const PLAN: Record<string, { title: string; period: string | null; months: number | null }> = {
  ANNUAL: { title: t('Yearly'), period: t('per year'), months: 12 },
  SIX_MONTH: { title: t('Six-monthly'), period: t('every 6 months'), months: 6 },
  THREE_MONTH: { title: t('Quarterly'), period: t('every 3 months'), months: 3 },
  TWO_MONTH: { title: t('Two-monthly'), period: t('every 2 months'), months: 2 },
  MONTHLY: { title: t('Monthly'), period: t('per month'), months: 1 },
  WEEKLY: { title: t('Weekly'), period: t('per week'), months: null },
  LIFETIME: { title: t('Lifetime'), period: t('one-off payment'), months: null },
};

export function sortPackages<T extends PackageLike>(packages: T[]): T[] {
  const rank = (p: PackageLike) => {
    const index = ORDER.indexOf(p.packageType);
    return index === -1 ? ORDER.length : index;
  };
  return [...packages].sort((a, b) => rank(a) - rank(b));
}

/** What the yearly plan saves against 12 monthly ones, as a rounded %, or null. */
export function annualSavingsPercent(packages: PackageLike[]): number | null {
  const annual = packages.find((p) => p.packageType === 'ANNUAL');
  const monthly = packages.find((p) => p.packageType === 'MONTHLY');
  if (!annual || !monthly || monthly.product.price <= 0) return null;
  const percent = Math.round((1 - annual.product.price / (monthly.product.price * 12)) * 100);
  return percent >= 1 ? percent : null;
}

export function durationLabel(count: number, unit: string): string {
  switch (unit) {
    case 'DAY':
      return count > 1 ? t('{count} days', { count }) : t('{count} day', { count });
    case 'WEEK':
      return count > 1 ? t('{count} weeks', { count }) : t('{count} week', { count });
    case 'MONTH':
      return count > 1 ? t('{count} months', { count }) : t('{count} month', { count });
    case 'YEAR':
      return count > 1 ? t('{count} years', { count }) : t('{count} year', { count });
    default:
      return `${count}`;
  }
}

const UNIT_SINGULAR: Record<string, () => string> = {
  DAY: () => t('day'),
  WEEK: () => t('week'),
  MONTH: () => t('month'),
  YEAR: () => t('year'),
};

/** The introductory offer, spelled out the way Apple and Google require (duration + price). */
export function introOfferLabel(intro: IntroPriceLike | null): string | null {
  if (!intro) return null;
  const cycles = Math.max(1, intro.cycles);
  if (intro.price === 0) {
    return t('{duration} free trial', { duration: durationLabel(intro.periodNumberOfUnits * cycles, intro.periodUnit) });
  }
  if (intro.periodNumberOfUnits === 1 && UNIT_SINGULAR[intro.periodUnit]) {
    return t('{price} per {unit} for {duration}', {
      price: intro.priceString,
      unit: UNIT_SINGULAR[intro.periodUnit](),
      duration: durationLabel(cycles, intro.periodUnit),
    });
  }
  return t('{price} for {duration}', {
    price: intro.priceString,
    duration: durationLabel(intro.periodNumberOfUnits * cycles, intro.periodUnit),
  });
}

export type PackageDisplay = {
  title: string;
  price: string;
  period: string | null;
  /** “that is £3.33 / month” for any plan longer than a month. */
  perMonth: string | null;
  intro: string | null;
  badge: string | null;
};

export function describePackage(pkg: PackageLike, savingsPercent: number | null): PackageDisplay {
  const plan = PLAN[pkg.packageType] ?? { title: pkg.identifier, period: null, months: null };
  const perMonth =
    plan.months && plan.months > 1 && pkg.product.pricePerMonthString
      ? t('that is {price} / month', { price: pkg.product.pricePerMonthString })
      : null;
  const badge = pkg.packageType === 'ANNUAL' && savingsPercent ? `−${savingsPercent}%` : null;
  return {
    title: plan.title,
    price: pkg.product.priceString,
    period: plan.period,
    perMonth,
    intro: introOfferLabel(pkg.product.introPrice),
    badge,
  };
}

/** The plan selected by default: the yearly one when it exists, otherwise the first offered. */
export function defaultPackage<T extends PackageLike>(packages: T[]): T | null {
  return sortPackages(packages)[0] ?? null;
}

const DAYS_PER_UNIT: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };

/** The free trial's length in days; null when the introductory offer is not free. */
export function freeTrialDays(intro: IntroPriceLike | null): number | null {
  if (!intro || intro.price !== 0) return null;
  const perUnit = DAYS_PER_UNIT[intro.periodUnit];
  if (!perUnit) return null;
  return intro.periodNumberOfUnits * Math.max(1, intro.cycles) * perUnit;
}

/**
 * How many days before the first payment we warn.
 *
 * Two days leave room to cancel without having to remember it the night before. But on a short
 * trial, two days' notice would land almost on the day of purchase: the reminder would read as a
 * sales nudge, and then leave silence until the charge. So we warn the day before as soon as the
 * trial drops under five days.
 */
export function trialReminderDaysBefore(trialDays: number): number {
  return trialDays >= 5 ? 2 : 1;
}

export type TrialStep = { when: string; what: string };

/** The trial, laid out before purchase: nothing hidden about when the first payment lands. */
export function trialTimeline(days: number, price: string): TrialStep[] {
  const reminderDay = Math.max(1, days - trialReminderDaysBefore(days));
  return [
    { when: t('Today'), what: t('All of Premium unlocks') },
    { when: t('Day {number}', { number: reminderDay }), what: t('We tell you the trial is about to end') },
    { when: t('Day {number}', { number: days }), what: t('First payment of {price}, unless you cancel before then', { price }) },
  ];
}

/**
 * When to remind about the end of the trial; null when it is already too late to warn.
 *
 * `trialDays` picks how much notice to give: without it, the notice is derived from the end date,
 * which stays right as long as the call happens during the trial.
 */
export function trialReminderDate(trialEnd: Date, now: Date, trialDays?: number): Date | null {
  const days = trialDays ?? Math.ceil((trialEnd.getTime() - now.getTime()) / 86_400_000);
  const reminder = new Date(trialEnd.getTime() - trialReminderDaysBefore(days) * 86_400_000);
  return reminder.getTime() > now.getTime() ? reminder : null;
}
