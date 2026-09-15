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
    throw new LocationPermissionDeniedError("Permission de localisation refusée");
  }
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}

// Nominatim (OpenStreetMap) — service public gratuit, sans clé, respecte la limite de 1 req/s.
export async function reverseGeocode({ latitude, longitude }: Coords): Promise<PlaceInfo> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Géocodage indisponible');
  const data = await response.json();
  const address = data.address ?? {};
  return {
    neighbourhood: address.neighbourhood ?? address.suburb ?? address.quarter ?? null,
    city: address.city ?? address.town ?? address.village ?? address.municipality ?? null,
    road: address.road ?? null,
    displayName: data.display_name ?? '',
  };
}

// Wikipédia REST — service public gratuit, sans clé.
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
  { bearing: 0, label: 'plein nord' },
  { bearing: 90, label: 'plein est' },
  { bearing: 180, label: 'plein sud' },
  { bearing: 270, label: 'plein ouest' },
];

// Pas de clé d'API de navigation disponible : on génère une boucle géométrique (carré)
// centrée sur la position de l'utilisateur, dimensionnée pour durer ~ le temps de l'activité.
export function generateWalkingLoop(start: Coords, totalMinutes: number): WalkingLeg[] {
  const totalDistanceM = totalMinutes * WALKING_SPEED_M_PER_MIN;
  // Boucle de secours, sans routage : les rues réelles la rallongeront, donc on la dimensionne
  // avec le même coefficient de détour pour ne pas dépasser la durée de l'activité.
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
          ? `Partez vers ${compass.label} pendant environ ${Math.round(legDistanceM / WALKING_SPEED_M_PER_MIN)} min.`
          : i === 3
            ? `Revenez vers votre point de départ (${compass.label}).`
            : `Tournez et continuez vers ${compass.label} pendant environ ${Math.round(legDistanceM / WALKING_SPEED_M_PER_MIN)} min.`,
      distanceM: legDistanceM,
      point: next,
    });
    current = next;
  }

  return legs;
}

// Les rues allongent un trajet d'environ 35 % par rapport au carré tracé à vol d'oiseau
// (mesuré à Paris). Ce n'est qu'un point de départ : fetchLoopWithinDuration corrige ensuite
// l'écart réel, qui varie selon le quartier.
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

/** Points de passage d'une boucle (départ → 3 coins → départ), à router ensuite sur les rues. */
export function generateLoopWaypoints(start: Coords, totalMinutes: number, firstBearing = randomBearing()): Coords[] {
  return loopWaypoints(start, initialSideM(totalMinutes), firstBearing);
}

// Fourchette acceptée : jamais plus long que l'activité, et pas beaucoup plus court non plus.
const MIN_DURATION_RATIO = 0.8;
const AIM_DURATION_RATIO = 0.92;
const MAX_ROUTE_ATTEMPTS = 4;
// Politique d'usage du serveur FOSSGIS : une requête par seconde au maximum.
const ROUTING_MIN_INTERVAL_MS = 1100;

export class RouteTooLongError extends Error {}

/**
 * Boucle routée sur les rues dont la durée de marche ne dépasse jamais `totalMinutes`.
 * Les rues rallongent le trajet de façon imprévisible : on route, on mesure la durée réelle,
 * puis on rétrécit (ou agrandit) la boucle proportionnellement et on recommence.
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
  throw new RouteTooLongError('Aucune boucle assez courte trouvée autour de cette position');
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

// Serveur OSRM piéton de FOSSGIS (données OpenStreetMap) : gratuit et sans clé, mais limité à
// 1 requête/s et à un usage modéré. À remplacer par un service dédié (instance OSRM/Valhalla
// auto-hébergée, ou fournisseur payant) avant un lancement public. L'attribution OpenStreetMap
// et un lien de signalement d'erreur sont obligatoires là où l'itinéraire est affiché.
const OSRM_FOOT_URL = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot';

const DIRECTION_LABELS: Record<string, string> = {
  left: 'à gauche',
  right: 'à droite',
  'slight left': 'légèrement à gauche',
  'slight right': 'légèrement à droite',
  'sharp left': 'franchement à gauche',
  'sharp right': 'franchement à droite',
  straight: 'tout droit',
};

function describeStep(step: OsrmStep): string {
  const { type, modifier } = step.maneuver;
  const street = step.name ? ` sur ${step.name}` : '';

  if (type === 'depart') return `Partez${street}`;
  if (type === 'arrive') return 'Vous êtes de retour à votre point de départ';
  if (modifier === 'uturn') return `Faites demi-tour${street}`;
  if (type === 'roundabout' || type === 'rotary') return `Prenez le rond-point${street}`;

  const direction = modifier ? DIRECTION_LABELS[modifier] : undefined;
  if (!direction || direction === 'tout droit') return `Continuez tout droit${street}`;
  return `Tournez ${direction}${street}`;
}

const MIN_STEP_METERS = 15;

export async function fetchWalkingRoute(waypoints: Coords[]): Promise<WalkingRoute> {
  const coordinates = waypoints.map((p) => `${p.longitude.toFixed(6)},${p.latitude.toFixed(6)}`).join(';');
  const response = await fetch(`${OSRM_FOOT_URL}/${coordinates}?overview=full&geometries=geojson&steps=true`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Regain/1.0 (application mobile bien-etre)' },
  });
  if (!response.ok) throw new Error('Itinéraire indisponible');

  const data: OsrmResponse = await response.json();
  const route = data.routes?.[0];
  if (data.code !== 'Ok' || !route) throw new Error('Itinéraire introuvable');

  // Chaque étape intermédiaire de la boucle renvoie son propre « départ / arrivée » : on ne garde
  // que le tout premier départ et la toute dernière arrivée, et on écarte les micro-segments.
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
