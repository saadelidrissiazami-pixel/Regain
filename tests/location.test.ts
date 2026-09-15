import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  RouteTooLongError,
  fetchLoopWithinDuration,
  fetchWalkingRoute,
  generateLoopWaypoints,
  type Coords,
} from '../src/lib/location';

// Module natif, inutilisable sous Node : seules les fonctions pures et le routage sont testés ici.
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
  it('forme une boucle fermée : départ, trois coins, retour au départ', () => {
    const points = generateLoopWaypoints(START, 30);
    expect(points).toHaveLength(5);
    expect(points[0]).toEqual(START);
    expect(points[4]).toEqual(START);
  });

  it('dimensionne la boucle sur la durée, en tenant compte du détour des rues', () => {
    // 30 min × 75 m/min = 2 250 m de marche ; 4 côtés, rues ≈ +35 % → côté d'environ 417 m.
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

  it('interroge le profil piéton avec les coordonnées au format longitude,latitude', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => OSRM_FIXTURE });
    vi.stubGlobal('fetch', fetchMock);

    await fetchWalkingRoute([START, { latitude: 48.86, longitude: 2.36 }]);

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain('/routed-foot/route/v1/foot/2.352200,48.856600;2.360000,48.860000');
    expect(url).toContain('geometries=geojson');
  });

  it("ne garde qu'un départ et une arrivée, et écarte les micro-segments", async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => OSRM_FIXTURE }));

    const route = await fetchWalkingRoute([START, START]);

    expect(route.steps.map((s) => s.instruction)).toEqual([
      'Partez sur Rue de Rivoli',
      'Tournez à droite sur Rue du Louvre',
      'Continuez tout droit sur Quai du Louvre',
      'Vous êtes de retour à votre point de départ',
    ]);
  });

  it('convertit la géométrie GeoJSON en coordonnées de carte', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => OSRM_FIXTURE }));

    const route = await fetchWalkingRoute([START, START]);

    expect(route.path[1]).toEqual({ latitude: 48.8571, longitude: 2.3601 });
    expect(route.distanceM).toBe(2310);
    expect(route.durationS).toBe(1850);
  });

  it('échoue proprement quand aucun itinéraire piéton n’existe', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'NoRoute', routes: [] }) })
    );

    await expect(fetchWalkingRoute([START, START])).rejects.toThrow('Itinéraire introuvable');
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

  it('accepte directement une boucle qui tient dans la durée', async () => {
    const fetchMock = vi.fn().mockResolvedValue(routeWithDuration(1700));
    vi.stubGlobal('fetch', fetchMock);

    const route = await fetchLoopWithinDuration(START, 30, { minIntervalMs: 0 });

    expect(route.durationS).toBe(1700);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rétrécit la boucle quand le parcours dépasse la durée de l’activité', async () => {
    // 33 min pour une activité de 30 min : c'est le cas réellement observé à Paris.
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

  it('agrandit la boucle quand elle est nettement plus courte que prévu', async () => {
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

  it('ne rend jamais une boucle plus longue que la durée demandée', async () => {
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

  it('échoue si aucune boucle ne tient dans la durée après tous les essais', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(routeWithDuration(2500)));

    await expect(fetchLoopWithinDuration(START, 30, { minIntervalMs: 0 })).rejects.toBeInstanceOf(
      RouteTooLongError
    );
  });
});
