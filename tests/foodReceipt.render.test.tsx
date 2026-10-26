import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AddFoodSheet } from '../src/components/cards/AddFoodSheet';
import { CalorieProgressCard } from '../src/components/cards/CalorieProgressCard';
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

const entry = (id: string, label: string, calories: number) => ({
  id,
  label,
  calories,
  protein_g: null,
  carbs_g: null,
  fat_g: null,
  source: 'manual',
});

describe('what the day is made of', () => {
  it('names each thing eaten, not only the total', () => {
    // The card counted and never named. After the sheet closed there was no trace of what had
    // been added — a number going up with nothing to check it against.
    render(
      <ThemeProvider>
        <CalorieProgressCard
          log={log({ entries: [entry('1', 'Chicken breast (150 g)', 248), entry('2', 'Yoghurt', 120)] as never })}
          onAdd={() => {}}
        />
      </ThemeProvider>
    );
    expect(screen.getByText('Chicken breast (150 g)')).toBeTruthy();
    expect(screen.getByText('Yoghurt')).toBeTruthy();
  });
});

describe('adding something to the day', () => {
  function sheet(onClose: () => void, over: Partial<NutritionLog> = {}) {
    const value = log(over);
    render(
      <ThemeProvider>
        <AddFoodSheet log={value} visible onClose={onClose} />
      </ThemeProvider>
    );
    return value;
  }

  function fill() {
    fireEvent.change(screen.getByPlaceholderText(/Chicken breast/), { target: { value: 'Soup' } });
    fireEvent.change(screen.getByPlaceholderText('450'), { target: { value: '300' } });
  }

  it('closes once the row is written, so the tap leaves a mark', () => {
    // It used to wipe the fields and stay open, which reads exactly like a tap that did nothing.
    const onClose = vi.fn();
    const value = sheet(onClose);
    fill();
    fireEvent.click(screen.getByText('Add'));

    expect(value.add).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    // The sheet closes on the callback the mutation fires, not on the tap.
    const [, options] = (value.add as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    options.onSaved();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stays open when the write fails, next to the form that caused it', () => {
    // Closing on the tap would hide the failure along with the fields somebody just filled in.
    const onClose = vi.fn();
    const value = sheet(onClose);
    fill();
    fireEvent.click(screen.getByText('Add'));
    expect(value.add).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
