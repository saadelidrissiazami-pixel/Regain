import { View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import type { Coords } from '../../lib/location';
import { Text } from '../typography';

const WIDTH = 320;
const HEIGHT = 220;
const PADDING = 18;

// react-native-maps n'existe pas sur le web : l'aperçu navigateur montre un schéma fidèle du
// tracé (mêmes coordonnées, proportions conservées) au lieu d'une carte interactive.
export function RouteMap({ path, start }: { path: Coords[]; start: Coords }) {
  const lats = path.map((p) => p.latitude);
  const lons = path.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const minLon = Math.min(...lons);
  // Un degré de longitude rétrécit avec la latitude : on corrige pour garder la forme réelle.
  const lonFactor = Math.cos((start.latitude * Math.PI) / 180);
  const spanLat = Math.max(Math.max(...lats) - minLat, 1e-6);
  const spanLon = Math.max((Math.max(...lons) - minLon) * lonFactor, 1e-6);
  const scale = Math.min((WIDTH - 2 * PADDING) / spanLon, (HEIGHT - 2 * PADDING) / spanLat);

  const project = (p: Coords) => ({
    x: PADDING + (p.longitude - minLon) * lonFactor * scale,
    y: HEIGHT - PADDING - (p.latitude - minLat) * scale,
  });

  const points = path.map((p) => {
    const { x, y } = project(p);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const startPoint = project(start);

  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-line bg-calm-soft">
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Polyline points={points.join(' ')} fill="none" stroke="#FF6B57" strokeWidth={3} strokeLinejoin="round" />
        <Circle cx={startPoint.x} cy={startPoint.y} r={7} fill="#1E9C86" stroke="#FFFFFF" strokeWidth={2} />
      </Svg>
      <Text className="px-3 pb-2 text-[11px] text-ink-soft">
        Aperçu du tracé — la carte interactive s&apos;affiche sur l&apos;application mobile.
      </Text>
    </View>
  );
}
