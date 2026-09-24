import * as Location from 'expo-location';

export type Coords = { latitude: number; longitude: number };

export type PlaceInfo = {
  neighbourhood: string | null;
  city: string | null;
  road: string | null;
  displayName: string;
};

export type WikiSummary = {
  title: string;
  extract: string;
};

export class LocationPermissionDeniedError extends Error {}

export async function requestAndGetLocation(): Promise<Coords> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new LocationPermissionDeniedError('Location permission refused');
  }
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}

// Nominatim (OpenStreetMap) — a free public service, no key, kept to its 1 req/s limit.
export async function reverseGeocode({ latitude, longitude }: Coords): Promise<PlaceInfo> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Geocoding unavailable');
  const data = await response.json();
  const address = data.address ?? {};
  return {
    neighbourhood: address.neighbourhood ?? address.suburb ?? address.quarter ?? null,
    city: address.city ?? address.town ?? address.village ?? address.municipality ?? null,
    road: address.road ?? null,
    displayName: data.display_name ?? '',
  };
}

// The Wikipedia REST API — a free public service, no key.
export async function fetchWikipediaSummary(title: string, lang = 'fr'): Promise<WikiSummary | null> {
  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.extract) return null;
    return { title: data.title ?? title, extract: data.extract };
  } catch {
    return null;
  }
}

const EARTH_RADIUS_M = 6371000;
const WALKING_SPEED_M_PER_MIN = 75; // ~4.5 km/h

function destinationPoint({ latitude, longitude }: Coords, bearingDeg: number, distanceM: number): Coords {
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (latitude * Math.PI) / 180;
  const lon1 = (longitude * Math.PI) / 180;
  const angularDistance = distanceM / EARTH_RADIUS_M;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) + Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return { latitude: (lat2 * 180) / Math.PI, longitude: (lon2 * 180) / Math.PI };
}

export type WalkingLeg = { instruction: string; distanceM: number; point: Coords };

const COMPASS_LABELS: { bearing: number; label: string }[] = [
  { bearing: 0, label: 'due north' },
  { bearing: 90, label: 'due east' },
  { bearing: 180, label: 'due south' },
  { bearing: 270, label: 'due west' },
];

// With no routing API key available, we build a geometric loop (a square) centred on the user's
// position, sized to last about as long as the activity.
export function generateWalkingLoop(start: Coords, totalMinutes: number): WalkingLeg[] {
  const totalDistanceM = totalMinutes * WALKING_SPEED_M_PER_MIN;
  // The fallback loop, with no routing: real streets will lengthen it, so it is sized with the
  // same detour factor to stay inside the activity's duration.
  const legDistanceM = Math.max(100, totalDistanceM / (4 * STREET_DETOUR_FACTOR));

  let current = start;
  const legs: WalkingLeg[] = [];
  const startBearingIndex = Math.floor(Math.random() * 4);

  for (let i = 0; i < 4; i++) {
    const compass = COMPASS_LABELS[(startBearingIndex + i) % 4];
    const next = destinationPoint(current, compass.bearing, legDistanceM);
    legs.push({
      instruction:
        i === 0
          ? `Head ${compass.label} for about ${Math.round(legDistanceM / WALKING_SPEED_M_PER_MIN)} min.`
          : i === 3
            ? `Head back towards where you started (${compass.label}).`
            : `Turn and carry on ${compass.label} for about ${Math.round(legDistanceM / WALKING_SPEED_M_PER_MIN)} min.`,
      distanceM: legDistanceM,
      point: next,
    });
    current = next;
  }

  return legs;
}

// Streets lengthen a route by roughly 35% against the square drawn as the crow flies (measured
// in Paris). That is only a starting point: fetchLoopWithinDuration then corrects the real gap,
// which varies from one neighbourhood to the next.
const STREET_DETOUR_FACTOR = 1.35;

function initialSideM(totalMinutes: number): number {
  return Math.max(120, (totalMinutes * WALKING_SPEED_M_PER_MIN) / (4 * STREET_DETOUR_FACTOR));
}

function randomBearing(): number {
  return Math.floor(Math.random() * 4) * 90;
}

function loopWaypoints(start: Coords, sideM: number, firstBearing: number): Coords[] {
  const points = [start];
  let current = start;
  for (let i = 0; i < 3; i++) {
    current = destinationPoint(current, (firstBearing + i * 90) % 360, sideM);
    points.push(current);
  }
  points.push(start);
  return points;
}

/** The waypoints of a loop (start → 3 corners → start), to be routed onto streets afterwards. */
export function generateLoopWaypoints(start: Coords, totalMinutes: number, firstBearing = randomBearing()): Coords[] {
  return loopWaypoints(start, initialSideM(totalMinutes), firstBearing);
}

// The accepted range: never longer than the activity, and not much shorter either.
const MIN_DURATION_RATIO = 0.8;
const AIM_DURATION_RATIO = 0.92;
const MAX_ROUTE_ATTEMPTS = 4;
// The FOSSGIS server's usage policy: one request per second at most.
const ROUTING_MIN_INTERVAL_MS = 1100;

export class RouteTooLongError extends Error {}

/**
 * A loop routed onto real streets whose walking time never exceeds `totalMinutes`.
 * Streets lengthen a route unpredictably, so we route it, measure the real duration, then shrink
 * (or grow) the loop in proportion and try again.
 */
export async function fetchLoopWithinDuration(
  start: Coords,
  totalMinutes: number,
  { minIntervalMs = ROUTING_MIN_INTERVAL_MS }: { minIntervalMs?: number } = {}
): Promise<WalkingRoute> {
  const targetS = totalMinutes * 60;
  const firstBearing = randomBearing();
  let sideM = initialSideM(totalMinutes);
  let bestWithinTarget: WalkingRoute | null = null;

  for (let attempt = 0; attempt < MAX_ROUTE_ATTEMPTS; attempt++) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, minIntervalMs));
    const route = await fetchWalkingRoute(loopWaypoints(start, sideM, firstBearing));

    if (route.durationS <= targetS) {
      if (route.durationS >= targetS * MIN_DURATION_RATIO) return route;
      if (!bestWithinTarget || route.durationS > bestWithinTarget.durationS) bestWithinTarget = route;
    }
    sideM = Math.max(40, sideM * ((targetS * AIM_DURATION_RATIO) / route.durationS));
  }

  if (bestWithinTarget) return bestWithinTarget;
  throw new RouteTooLongError('No loop short enough was found around this position');
}

export type RouteStep = { instruction: string; distanceM: number };

export type WalkingRoute = {
  path: Coords[];
  distanceM: number;
  durationS: number;
  steps: RouteStep[];
};

type OsrmStep = {
  name: string;
  distance: number;
  maneuver: { type: string; modifier?: string };
};

type OsrmResponse = {
  code: string;
  routes?: {
    distance: number;
    duration: number;
    geometry: { coordinates: [number, number][] };
    legs: { steps: OsrmStep[] }[];
  }[];
};

// FOSSGIS's walking OSRM server (OpenStreetMap data): free and keyless, but capped at 1 req/s
// and at modest use. To be replaced by a dedicated service (a self-hosted OSRM/Valhalla instance,
// or a paid provider) before any public launch. OpenStreetMap attribution and a link for
// reporting an error are mandatory wherever the route is shown.
const OSRM_FOOT_URL = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot';

const DIRECTION_LABELS: Record<string, string> = {
  left: 'left',
  right: 'right',
  'slight left': 'slightly left',
  'slight right': 'slightly right',
  'sharp left': 'sharp left',
  'sharp right': 'sharp right',
  straight: 'straight on',
};

function describeStep(step: OsrmStep): string {
  const { type, modifier } = step.maneuver;
  const street = step.name ? ` onto ${step.name}` : '';

  if (type === 'depart') return `Set off${street}`;
  if (type === 'arrive') return 'You are back where you started';
  if (modifier === 'uturn') return `Turn around${street}`;
  if (type === 'roundabout' || type === 'rotary') return `Take the roundabout${street}`;

  const direction = modifier ? DIRECTION_LABELS[modifier] : undefined;
  if (!direction || direction === 'straight on') return `Carry straight on${street}`;
  return `Turn ${direction}${street}`;
}

const MIN_STEP_METERS = 15;

export async function fetchWalkingRoute(waypoints: Coords[]): Promise<WalkingRoute> {
  const coordinates = waypoints.map((p) => `${p.longitude.toFixed(6)},${p.latitude.toFixed(6)}`).join(';');
  const response = await fetch(`${OSRM_FOOT_URL}/${coordinates}?overview=full&geometries=geojson&steps=true`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Regain/1.0 (wellbeing mobile app)' },
  });
  if (!response.ok) throw new Error('Route unavailable');

  const data: OsrmResponse = await response.json();
  const route = data.routes?.[0];
  if (data.code !== 'Ok' || !route) throw new Error('No route found');

  // Every intermediate leg of the loop reports its own “depart / arrive”, so we keep only the
  // very first departure and the very last arrival, and drop the micro-segments.
  const steps: RouteStep[] = [];
  route.legs.forEach((leg, legIndex) => {
    const isFirstLeg = legIndex === 0;
    const isLastLeg = legIndex === route.legs.length - 1;
    for (const step of leg.steps) {
      const type = step.maneuver.type;
      if (type === 'depart' && !isFirstLeg) continue;
      if (type === 'arrive' && !isLastLeg) continue;
      if (type !== 'depart' && type !== 'arrive' && step.distance < MIN_STEP_METERS) continue;
      steps.push({ instruction: describeStep(step), distanceM: step.distance });
    }
  });

  return {
    path: route.geometry.coordinates.map(([longitude, latitude]) => ({ latitude, longitude })),
    distanceM: route.distance,
    durationS: route.duration,
    steps,
  };
}
