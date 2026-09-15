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
  ANNUAL: { title: 'Annuel', period: 'par an', months: 12 },
  SIX_MONTH: { title: 'Semestriel', period: 'tous les 6 mois', months: 6 },
  THREE_MONTH: { title: 'Trimestriel', period: 'tous les 3 mois', months: 3 },
  TWO_MONTH: { title: 'Bimestriel', period: 'tous les 2 mois', months: 2 },
  MONTHLY: { title: 'Mensuel', period: 'par mois', months: 1 },
  WEEKLY: { title: 'Hebdomadaire', period: 'par semaine', months: null },
  LIFETIME: { title: 'À vie', period: 'paiement unique', months: null },
};

export function sortPackages<T extends PackageLike>(packages: T[]): T[] {
  const rank = (p: PackageLike) => {
    const index = ORDER.indexOf(p.packageType);
    return index === -1 ? ORDER.length : index;
  };
  return [...packages].sort((a, b) => rank(a) - rank(b));
}

/** Économie de l'annuel par rapport à 12 mensualités, en % arrondi (null si aucune). */
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
      return `${count} jour${count > 1 ? 's' : ''}`;
    case 'WEEK':
      return `${count} semaine${count > 1 ? 's' : ''}`;
    case 'MONTH':
      return `${count} mois`;
    case 'YEAR':
      return `${count} an${count > 1 ? 's' : ''}`;
    default:
      return `${count}`;
  }
}

const UNIT_SINGULAR: Record<string, string> = { DAY: 'jour', WEEK: 'semaine', MONTH: 'mois', YEAR: 'an' };

/** Offre de lancement, telle qu'Apple et Google exigent qu'elle soit affichée (durée + prix). */
export function introOfferLabel(intro: IntroPriceLike | null): string | null {
  if (!intro) return null;
  const cycles = Math.max(1, intro.cycles);
  if (intro.price === 0) {
    return `${durationLabel(intro.periodNumberOfUnits * cycles, intro.periodUnit)} d'essai gratuit`;
  }
  if (intro.periodNumberOfUnits === 1 && UNIT_SINGULAR[intro.periodUnit]) {
    return `${intro.priceString} par ${UNIT_SINGULAR[intro.periodUnit]} pendant ${durationLabel(cycles, intro.periodUnit)}`;
  }
  return `${intro.priceString} pour ${durationLabel(intro.periodNumberOfUnits * cycles, intro.periodUnit)}`;
}

export type PackageDisplay = {
  title: string;
  price: string;
  period: string | null;
  /** « soit 3,33 € / mois » pour les formules de plus d'un mois. */
  perMonth: string | null;
  intro: string | null;
  badge: string | null;
};

export function describePackage(pkg: PackageLike, savingsPercent: number | null): PackageDisplay {
  const plan = PLAN[pkg.packageType] ?? { title: pkg.identifier, period: null, months: null };
  const perMonth =
    plan.months && plan.months > 1 && pkg.product.pricePerMonthString
      ? `soit ${pkg.product.pricePerMonthString} / mois`
      : null;
  const badge = pkg.packageType === 'ANNUAL' && savingsPercent ? `−${savingsPercent} %` : null;
  return {
    title: plan.title,
    price: pkg.product.priceString,
    period: plan.period,
    perMonth,
    intro: introOfferLabel(pkg.product.introPrice),
    badge,
  };
}

/** Formule présélectionnée : l'annuelle si elle existe, sinon la première proposée. */
export function defaultPackage<T extends PackageLike>(packages: T[]): T | null {
  return sortPackages(packages)[0] ?? null;
}
