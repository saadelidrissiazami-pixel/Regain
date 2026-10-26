import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppErrorBoundary } from '../src/components/feedback/AppErrorBoundary';

function crash(message: string, stack?: string) {
  const error = new Error(message);
  if (stack !== undefined) error.stack = stack;
  render(<AppErrorBoundary error={error} retry={() => Promise.resolve()} />);
  return error;
}

describe('the screen shown when something breaks', () => {
  it('says what broke, so somebody who hit it can report it', () => {
    // It used to say nothing outside development. Somebody then hit this screen on a real phone
    // and there was not a sentence to go on — which is how a crash stays undiagnosed.
    crash('nothing is not a function');
    expect(screen.getByText(/nothing is not a function/)).toBeTruthy();
  });

  it('names the first line of our own code, not the framework it passed through', () => {
    crash(
      'boom',
      ['Error: boom', '    at node_modules/react/cjs/react.js:12:1', '    at WellbeingSessionScreen (app/session.tsx:88:7)'].join('\n')
    );
    expect(screen.getByText(/WellbeingSessionScreen/)).toBeTruthy();
    expect(screen.queryByText(/node_modules/)).toBeNull();
  });

  it('still offers the way out, and says nothing was lost', () => {
    crash('boom');
    expect(screen.getByText('Start again')).toBeTruthy();
    expect(screen.getByText(/Nothing you recorded is lost/)).toBeTruthy();
  });

  it('survives an error with no stack at all', () => {
    // A thrown string, or an error from a native module, may carry nothing. The crash screen is
    // the one screen that must never be the thing that crashes.
    expect(() => crash('boom', undefined)).not.toThrow();
    expect(screen.getByText(/boom/)).toBeTruthy();
  });
});
