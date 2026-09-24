import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  RouteTooLongError,
  fetchLoopWithinDuration,
  fetchWalkingRoute,
  generateLoopWaypoints,
  type Coords,
} from '../src/lib/location';

// A native module, unusable under Node: only the pure functions and the routing are tested here.
vi.mock('expo-location', () => ({}));

const START: Coords = { latitude: 48.8566, longitude: 2.3522 };

function distanceMeters(a: Coords, b: Coords): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

describe('generateLoopWaypoints', () => {
  it('forms a closed loop: start, three corners, back to the start', () => {
    const points = generateLoopWaypoints(START, 30);
    expect(points).toHaveLength(5);
    expect(points[0]).toEqual(START);
    expect(points[4]).toEqual(START);
  });

  it('sizes the loop to the duration, allowing for the detour of real streets', () => {
    // 30 min × 75 m/min = 2,250 m of walking; 4 sides, streets ≈ +35% → a side of about 417 m.
    const points = generateLoopWaypoints(START, 30);
    expect(distanceMeters(points[0], points[1])).toBeCloseTo(2250 / (4 * 1.35), 0);
  });
});

function osrmStep(type: string, name: string, distance: number, modifier?: string) {
  return { name, distance, maneuver: { type, modifier } };
}

const OSRM_FIXTURE = {
  code: 'Ok',
  routes: [
    {
      distance: 2310,
      duration: 1850,
      geometry: {
        coordinates: [
          [2.3522, 48.8566],
          [2.3601, 48.8571],
          [2.3522, 48.8566],
        ],
      },
      legs: [
        {
          steps: [
            osrmStep('depart', 'Rue de Rivoli', 50),
            osrmStep('turn', 'Rue du Louvre', 200, 'right'),
            osrmStep('turn', '', 5, 'left'),
            osrmStep('arrive', '', 0),
          ],
        },
        {
          steps: [
            osrmStep('depart', '', 0),
            osrmStep('continue', 'Quai du Louvre', 120, 'straight'),
            osrmStep('arrive', '', 0),
          ],
        },
      ],
    },
  ],
};

describe('fetchWalkingRoute', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('queries the walking profile with coordinates as longitude,latitude', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => OSRM_FIXTURE });
    vi.stubGlobal('fetch', fetchMock);

    await fetchWalkingRoute([START, { latitude: 48.86, longitude: 2.36 }]);

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain('/routed-foot/route/v1/foot/2.352200,48.856600;2.360000,48.860000');
    expect(url).toContain('geometries=geojson');
  });

  it('keeps only one departure and one arrival, and drops the micro-segments', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => OSRM_FIXTURE }));

    const route = await fetchWalkingRoute([START, START]);

    expect(route.steps.map((s) => s.instruction)).toEqual([
      'Set off onto Rue de Rivoli',
      'Turn right onto Rue du Louvre',
      'Carry straight on onto Quai du Louvre',
      'You are back where you started',
    ]);
  });

  it('converts the GeoJSON geometry into map coordinates', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => OSRM_FIXTURE }));

    const route = await fetchWalkingRoute([START, START]);

    expect(route.path[1]).toEqual({ latitude: 48.8571, longitude: 2.3601 });
    expect(route.distanceM).toBe(2310);
    expect(route.durationS).toBe(1850);
  });

  it('fails cleanly when no walking route exists', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'NoRoute', routes: [] }) })
    );

    await expect(fetchWalkingRoute([START, START])).rejects.toThrow('No route found');
  });
});

describe('fetchLoopWithinDuration', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function routeWithDuration(durationS: number) {
    return {
      ok: true,
      json: async () => ({ ...OSRM_FIXTURE, routes: [{ ...OSRM_FIXTURE.routes[0], duration: durationS }] }),
    };
  }

  function firstCornerDistance(url: string): number {
    const [lon, lat] = url.split('/foot/')[1].split('?')[0].split(';')[1].split(',').map(Number);
    return distanceMeters(START, { latitude: lat, longitude: lon });
  }

  it('accepts a loop that already fits the duration', async () => {
    const fetchMock = vi.fn().mockResolvedValue(routeWithDuration(1700));
    vi.stubGlobal('fetch', fetchMock);

    const route = await fetchLoopWithinDuration(START, 30, { minIntervalMs: 0 });

    expect(route.durationS).toBe(1700);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('shrinks the loop when the route runs past the activity’s duration', async () => {
    // 33 min for a 30 min activity: the case actually observed in Paris.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(routeWithDuration(1980))
      .mockResolvedValueOnce(routeWithDuration(1650));
    vi.stubGlobal('fetch', fetchMock);

    const route = await fetchLoopWithinDuration(START, 30, { minIntervalMs: 0 });

    expect(route.durationS).toBe(1650);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(firstCornerDistance(fetchMock.mock.calls[1][0])).toBeLessThan(
      firstCornerDistance(fetchMock.mock.calls[0][0])
    );
  });

  it('grows the loop when it comes out markedly shorter than intended', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(routeWithDuration(900))
      .mockResolvedValueOnce(routeWithDuration(1640));
    vi.stubGlobal('fetch', fetchMock);

    const route = await fetchLoopWithinDuration(START, 30, { minIntervalMs: 0 });

    expect(route.durationS).toBe(1640);
    expect(firstCornerDistance(fetchMock.mock.calls[1][0])).toBeGreaterThan(
      firstCornerDistance(fetchMock.mock.calls[0][0])
    );
  });

  it('never returns a loop longer than the duration asked for', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(routeWithDuration(2000))
      .mockResolvedValueOnce(routeWithDuration(1200))
      .mockResolvedValueOnce(routeWithDuration(1900))
      .mockResolvedValueOnce(routeWithDuration(1300));
    vi.stubGlobal('fetch', fetchMock);

    const route = await fetchLoopWithinDuration(START, 30, { minIntervalMs: 0 });

    expect(route.durationS).toBe(1300);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('fails if no loop fits the duration after every attempt', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(routeWithDuration(2500)));

    await expect(fetchLoopWithinDuration(START, 30, { minIntervalMs: 0 })).rejects.toBeInstanceOf(
      RouteTooLongError
    );
  });
});
