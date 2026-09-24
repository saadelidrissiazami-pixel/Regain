// Mise en forme des offres RevenueCat pour le paywall. Types structurels (compatibles avec
// PurchasesPackage) pour rester testable sans charger le module natif.

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
  ANNUAL: { title: 'Yearly', period: 'per year', months: 12 },
  SIX_MONTH: { title: 'Six-monthly', period: 'every 6 months', months: 6 },
  THREE_MONTH: { title: 'Quarterly', period: 'every 3 months', months: 3 },
  TWO_MONTH: { title: 'Two-monthly', period: 'every 2 months', months: 2 },
  MONTHLY: { title: 'Monthly', period: 'per month', months: 1 },
  WEEKLY: { title: 'Weekly', period: 'per week', months: null },
  LIFETIME: { title: 'Lifetime', period: 'one-off payment', months: null },
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
      return `${count} day${count > 1 ? 's' : ''}`;
    case 'WEEK':
      return `${count} week${count > 1 ? 's' : ''}`;
    case 'MONTH':
      return `${count} month${count > 1 ? 's' : ''}`;
    case 'YEAR':
      return `${count} year${count > 1 ? 's' : ''}`;
    default:
      return `${count}`;
  }
}

const UNIT_SINGULAR: Record<string, string> = { DAY: 'day', WEEK: 'week', MONTH: 'month', YEAR: 'year' };

/** The introductory offer, spelled out the way Apple and Google require (duration + price). */
export function introOfferLabel(intro: IntroPriceLike | null): string | null {
  if (!intro) return null;
  const cycles = Math.max(1, intro.cycles);
  if (intro.price === 0) {
    return `${durationLabel(intro.periodNumberOfUnits * cycles, intro.periodUnit)} free trial`;
  }
  if (intro.periodNumberOfUnits === 1 && UNIT_SINGULAR[intro.periodUnit]) {
    return `${intro.priceString} per ${UNIT_SINGULAR[intro.periodUnit]} for ${durationLabel(cycles, intro.periodUnit)}`;
  }
  return `${intro.priceString} for ${durationLabel(intro.periodNumberOfUnits * cycles, intro.periodUnit)}`;
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
      ? `that is ${pkg.product.pricePerMonthString} / month`
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
    { when: 'Today', what: 'All of Premium unlocks' },
    { when: `Day ${reminderDay}`, what: 'We tell you the trial is about to end' },
    { when: `Day ${days}`, what: `First payment of ${price}, unless you cancel before then` },
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
