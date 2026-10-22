import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AddFoodSheet } from '../src/components/cards/AddFoodSheet';
import type { NutritionLog } from '../src/hooks/useNutritionLog';
import { ThemeProvider } from '../src/theme/ThemeProvider';

function log(over: Partial<NutritionLog> = {}): NutritionLog {
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
    add: vi.fn(),
    remove: vi.fn(),
    ...over,
  } as unknown as NutritionLog;
}

function show(value: NutritionLog = log()) {
  render(
    <ThemeProvider>
      <AddFoodSheet log={value} visible onClose={() => {}} />
    </ThemeProvider>
  );
  return value;
}

/** The food field, found by the label the person reads rather than by a test id. */
function foodField() {
  return screen.getByPlaceholderText(/Chicken breast/);
}

describe('noting a meal', () => {
  it('proposes foods as soon as a few letters are typed', () => {
    show();
    expect(screen.queryByText(/Chicken breast$/)).toBeNull();
    fireEvent.change(foodField(), { target: { value: 'chick' } });
    expect(screen.getByText(/Chicken breast/)).toBeTruthy();
  });

  it('stops proposing once a food has been chosen, and says what the helping comes to', () => {
    show();
    fireEvent.change(foodField(), { target: { value: 'chick' } });
    fireEvent.click(screen.getByText(/Chicken breast/));
    // A list under a field somebody has finished with is in the way, so no suggestion row is left.
    // The name now lives in the field's value, which is why it is read there and not as text.
    expect(screen.queryAllByText(/Chicken breast/)).toEqual([]);
    expect((foodField() as HTMLInputElement).value).toMatch(/Chicken breast/);
    expect(screen.getByText(/That comes to/)).toBeTruthy();
  });

  it('asks for the four numbers by hand only while no food is chosen', () => {
    show();
    expect(screen.getByPlaceholderText('450')).toBeTruthy();
    fireEvent.change(foodField(), { target: { value: 'chick' } });
    fireEvent.click(screen.getByText(/Chicken breast/));
    // A canteen dish is why typing stays possible; a chosen food is why it stops being asked for.
    expect(screen.queryByPlaceholderText('450')).toBeNull();
  });

  it('saves the quantity inside the label, because nothing else keeps it', () => {
    const value = show();
    fireEvent.change(foodField(), { target: { value: 'chick' } });
    fireEvent.click(screen.getByText(/Chicken breast/));
    fireEvent.click(screen.getByText('Add'));
    expect(value.add).toHaveBeenCalledOnce();
    const [entry] = (value.add as unknown as { mock: { calls: [{ label: string; calories: number }][] } }).mock.calls[0];
    expect(entry.label).toMatch(/Chicken breast \(\d+ g\)/);
    expect(entry.calories).toBeGreaterThan(0);
  });

  it('says why a save failed instead of failing quietly', () => {
    // The shape Supabase returns, which is not an Error — the reason a missing column once showed
    // as nothing at all.
    show(log({ addError: { message: 'Network request failed' } as unknown as Error }));
    expect(screen.getByText(/connection looks interrupted/)).toBeTruthy();
  });
});
