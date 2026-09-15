import { describe, expect, it } from 'vitest';

import {
  annualSavingsPercent,
  defaultPackage,
  describePackage,
  introOfferLabel,
  sortPackages,
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
      title: 'Annuel',
      price: '39,99 €',
      period: 'par an',
      perMonth: 'soit 3,33 € / mois',
      intro: null,
      badge: '−33 %',
    });
    const monthly = describePackage(MONTHLY, 33);
    expect(monthly.perMonth).toBeNull();
    expect(monthly.badge).toBeNull();
  });

  it("décrit l'essai gratuit et les prix de lancement en toutes lettres", () => {
    expect(introOfferLabel({ price: 0, priceString: '0,00 €', cycles: 1, periodUnit: 'WEEK', periodNumberOfUnits: 1 })).toBe(
      "1 semaine d'essai gratuit"
    );
    expect(introOfferLabel({ price: 0, priceString: '0,00 €', cycles: 1, periodUnit: 'DAY', periodNumberOfUnits: 7 })).toBe(
      "7 jours d'essai gratuit"
    );
    expect(introOfferLabel({ price: 1.99, priceString: '1,99 €', cycles: 3, periodUnit: 'MONTH', periodNumberOfUnits: 1 })).toBe(
      '1,99 € par mois pendant 3 mois'
    );
    expect(introOfferLabel({ price: 9.99, priceString: '9,99 €', cycles: 1, periodUnit: 'MONTH', periodNumberOfUnits: 6 })).toBe(
      '9,99 € pour 6 mois'
    );
    expect(introOfferLabel(null)).toBeNull();
  });
});
