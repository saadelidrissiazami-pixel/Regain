import { useCallback, useEffect, useState } from 'react';

/** Horloge de séance en secondes : lecture / pause, avance et recul de 15 s. */
export function useSessionClock(totalSeconds: number) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= totalSeconds) {
          setRunning(false);
          return totalSeconds;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, totalSeconds]);

  const seek = useCallback(
    (delta: number) => setElapsed((e) => Math.min(totalSeconds, Math.max(0, e + delta))),
    [totalSeconds]
  );

  return {
    elapsed,
    total: totalSeconds,
    running,
    toggle: () => setRunning((r) => (elapsed >= totalSeconds ? r : !r)),
    pause: () => setRunning(false),
    seek,
    reset: () => {
      setElapsed(0);
      setRunning(true);
    },
  };
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
