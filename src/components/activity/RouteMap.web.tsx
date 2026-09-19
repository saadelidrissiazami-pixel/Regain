import { View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import type { Coords } from '../../lib/location';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../ui/Text';

const WIDTH = 320;
const HEIGHT = 220;
const PADDING = 18;

// react-native-maps n'existe pas sur le web : l'aperçu navigateur montre un schéma fidèle du
// tracé (mêmes coordonnées, proportions conservées) au lieu d'une carte interactive.
export function RouteMap({ path, start }: { path: Coords[]; start: Coords }) {
  const theme = useTheme();
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
    <View style={{ marginBottom: 12, overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.sage100 }}>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Polyline points={points.join(' ')} fill="none" stroke={theme.primary600} strokeWidth={3} strokeLinejoin="round" />
        <Circle cx={startPoint.x} cy={startPoint.y} r={7} fill={theme.orange} stroke="#FFFFFF" strokeWidth={2} />
      </Svg>
      <Text variant="caption" tone="ink2" style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
        Aperçu du tracé — la carte interactive s&apos;affiche sur l&apos;application mobile.
      </Text>
    </View>
  );
}
