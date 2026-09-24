import { describe, expect, it } from 'vitest';

import {
  annualSavingsPercent,
  defaultPackage,
  describePackage,
  freeTrialDays,
  introOfferLabel,
  sortPackages,
  trialReminderDate,
  trialTimeline,
  type PackageLike,
} from '../src/features/subscriptions/packages';

function pkg(packageType: string, price: number, priceString: string, extra: Partial<PackageLike['product']> = {}): PackageLike {
  return {
    identifier: `$rc_${packageType.toLowerCase()}`,
    packageType,
    product: { price, priceString, pricePerMonthString: null, introPrice: null, ...extra },
  };
}

const MONTHLY = pkg('MONTHLY', 4.99, '4,99 €', { pricePerMonthString: '4,99 €' });
const ANNUAL = pkg('ANNUAL', 39.99, '39,99 €', { pricePerMonthString: '3,33 €' });

describe('offres du paywall', () => {
  it("met l'annuel en premier et le présélectionne", () => {
    expect(sortPackages([MONTHLY, ANNUAL]).map((p) => p.packageType)).toEqual(['ANNUAL', 'MONTHLY']);
    expect(defaultPackage([MONTHLY, ANNUAL])).toBe(ANNUAL);
    expect(defaultPackage([])).toBeNull();
  });

  it("calcule l'économie de l'annuel face à 12 mensualités", () => {
    expect(annualSavingsPercent([MONTHLY, ANNUAL])).toBe(33);
    expect(annualSavingsPercent([ANNUAL])).toBeNull();
    expect(annualSavingsPercent([MONTHLY, pkg('ANNUAL', 59.88, '59,88 €')])).toBeNull();
  });

  it('affiche prix, période, équivalent mensuel et badge', () => {
    expect(describePackage(ANNUAL, 33)).toEqual({
      title: 'Yearly',
      price: '39,99 €',
      period: 'per year',
      perMonth: 'that is 3,33 € / month',
      intro: null,
      badge: '−33%',
    });
    const monthly = describePackage(MONTHLY, 33);
    expect(monthly.perMonth).toBeNull();
    expect(monthly.badge).toBeNull();
  });

  it("décrit l'essai gratuit et les prix de lancement en toutes lettres", () => {
    expect(introOfferLabel({ price: 0, priceString: '0,00 €', cycles: 1, periodUnit: 'WEEK', periodNumberOfUnits: 1 })).toBe(
      '1 week free trial'
    );
    expect(introOfferLabel({ price: 0, priceString: '0,00 €', cycles: 1, periodUnit: 'DAY', periodNumberOfUnits: 7 })).toBe(
      '7 days free trial'
    );
    expect(introOfferLabel({ price: 1.99, priceString: '1,99 €', cycles: 3, periodUnit: 'MONTH', periodNumberOfUnits: 1 })).toBe(
      '1,99 € per month for 3 months'
    );
    expect(introOfferLabel({ price: 9.99, priceString: '9,99 €', cycles: 1, periodUnit: 'MONTH', periodNumberOfUnits: 6 })).toBe(
      '9,99 € for 6 months'
    );
    expect(introOfferLabel(null)).toBeNull();
  });
});

describe("essai gratuit", () => {
  const free = (unit: string, units: number) => ({ price: 0, priceString: '0,00 €', cycles: 1, periodUnit: unit, periodNumberOfUnits: units });

  it("calcule sa durée en jours, et ignore les offres payantes", () => {
    expect(freeTrialDays(free('WEEK', 1))).toBe(7);
    expect(freeTrialDays(free('DAY', 14))).toBe(14);
    expect(freeTrialDays({ ...free('MONTH', 1), price: 1.99 })).toBeNull();
    expect(freeTrialDays(null)).toBeNull();
  });

  it("annonce le rappel et la date du premier paiement", () => {
    expect(trialTimeline(7, '49,99 €')).toEqual([
      { when: 'Today', what: 'All of Premium unlocks' },
      { when: 'Day 5', what: 'We tell you the trial is about to end' },
      { when: 'Day 7', what: 'First payment of 49,99 €, unless you cancel before then' },
    ]);
  });

  it("prévient la veille sur un essai court, où deux jours d'avance tomberaient presque le jour de l'achat", () => {
    expect(trialTimeline(3, '49,99 €')).toEqual([
      { when: 'Today', what: 'All of Premium unlocks' },
      { when: 'Day 2', what: 'We tell you the trial is about to end' },
      { when: 'Day 3', what: 'First payment of 49,99 €, unless you cancel before then' },
    ]);
  });

  it("programme le rappel deux jours avant la fin, sauf s'il est trop tard", () => {
    const end = new Date('2026-09-26T10:00:00Z');
    expect(trialReminderDate(end, new Date('2026-09-19T10:00:00Z'))?.toISOString()).toBe('2026-09-24T10:00:00.000Z');
    expect(trialReminderDate(end, new Date('2026-09-25T10:00:00Z'))).toBeNull();
  });

  it('sur un essai de trois jours, programme le rappel la veille', () => {
    const end = new Date('2026-09-24T10:00:00Z');
    const now = new Date('2026-09-21T10:00:00Z');
    expect(trialReminderDate(end, now, 3)?.toISOString()).toBe('2026-09-23T10:00:00.000Z');
    // Sans la durée, elle se déduit du temps restant : même résultat pendant l'essai.
    expect(trialReminderDate(end, now)?.toISOString()).toBe('2026-09-23T10:00:00.000Z');
  });
});
