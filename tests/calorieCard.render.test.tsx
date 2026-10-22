import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CalorieProgressCard } from '../src/components/cards/CalorieProgressCard';
import type { NutritionLog } from '../src/hooks/useNutritionLog';
import { ThemeProvider } from '../src/theme/ThemeProvider';

function log(over: Partial<NutritionLog>): NutritionLog {
  return {
    isError: false,
    status: 'empty',
    target: 2000,
    totals: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
    remainingKcal: 2000,
    proteinTarget: 0,
    carbsTarget: 0,
    fatTarget: 0,
    complements: [],
    entries: [],
    adding: false,
    addError: null,
    add: () => {},
    remove: () => {},
    ...over,
  } as unknown as NutritionLog;
}

function show(value: NutritionLog) {
  return render(
    <ThemeProvider>
      <CalorieProgressCard log={value} onAdd={() => {}} />
    </ThemeProvider>
  );
}

describe('the day on your plate', () => {
  it('never shows a failed read as an empty day', () => {
    // The two would otherwise read the same, and somebody would add their lunch a second time.
    show(log({ isError: true, status: 'empty' }));
    expect(screen.queryByText(/Nothing noted yet today/)).toBeNull();
    expect(screen.getByText(/could not be loaded/)).toBeTruthy();
  });

  it('counts down while there is room', () => {
    show(log({ status: 'under', remainingKcal: 640 }));
    expect(screen.getByText(/640 kcal to go/)).toBeTruthy();
  });

  it('states the number and stops counting once past the target', () => {
    // An app that scolds somebody for eating does harm, and the target is an estimate anyway.
    show(log({ status: 'over', totals: { calories: 2310, proteinG: 0, carbsG: 0, fatG: 0 } }));
    expect(screen.getByText(/2310 kcal noted today/)).toBeTruthy();
    expect(screen.queryByText(/to go/)).toBeNull();
  });

  it('hides the macro line until the profile implies a target', () => {
    show(log({ status: 'under', remainingKcal: 100 }));
    expect(screen.queryByText(/prot/)).toBeNull();
  });

  it('shows the three macros once there is a target for them', () => {
    show(log({ status: 'under', remainingKcal: 100, proteinTarget: 120, carbsTarget: 200, fatTarget: 70 }));
    expect(screen.getByText(/120 g/)).toBeTruthy();
    expect(screen.getByText(/200 g/)).toBeTruthy();
    expect(screen.getByText(/70 g/)).toBeTruthy();
  });
});
