import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { activityIllustration } from '../src/components/illustrations/ActivityIllustration';
import { Thumbnail } from '../src/components/ui/Thumbnail';
import { ThemeProvider } from '../src/theme/ThemeProvider';

function show(slug?: string | null) {
  return render(
    <ThemeProvider>
      <Thumbnail
        width={84}
        height={84}
        icon="leaf-outline"
        illustration={activityIllustration('indoor', slug)}
      />
    </ThemeProvider>
  ).container;
}

describe('the drawing on an activity card', () => {
  it('actually draws, rather than compiling and rendering nothing', () => {
    // react-native-svg goes through a different implementation on each platform. That the module
    // imports is not the same as the shapes reaching the screen.
    const svg = show('make-something-warm')?.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.querySelectorAll('rect, circle, path, ellipse').length).toBeGreaterThan(3);
  });

  it('covers the frame instead of leaving the card half empty', () => {
    // `slice` is what makes this behave like a photograph's resizeMode="cover". `meet` would
    // letterbox the square inside the wide detail header.
    const svg = show('make-something-warm')?.querySelector('svg');
    expect(svg?.getAttribute('preserveAspectRatio')).toBe('xMidYMid slice');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 64 64');
  });

  it('falls back to the category icon for a row it has no drawing for', () => {
    // A row added to the catalogue after this build shipped must still get a card, not a hole.
    const container = show('an-activity-added-later');
    expect(container?.querySelector('svg')).toBeNull();
    expect(container?.querySelector('[data-icon="leaf-outline"]')).not.toBeNull();
  });

  it('falls back the same way for a row with no identifier at all', () => {
    expect(show(null)?.querySelector('[data-icon="leaf-outline"]')).not.toBeNull();
  });
});
