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
  const legDistanceM = Math.max(150, totalDistanceM / 4);

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
