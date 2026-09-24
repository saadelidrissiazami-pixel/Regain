import { useRef } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import type { Coords } from '../../lib/location';
import { useTheme } from '../../theme/ThemeProvider';

// The mobile version (iOS: Apple Maps, no key). The web uses RouteMap.web.tsx, since
// react-native-maps has no browser implementation.
export function RouteMap({ path, start }: { path: Coords[]; start: Coords }) {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);

  return (
    <View style={{ height: 260, marginBottom: 12, overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: theme.line }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: start.latitude,
          longitude: start.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        onMapReady={() =>
          mapRef.current?.fitToCoordinates(path, {
            edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
            animated: false,
          })
        }
      >
        <Polyline coordinates={path} strokeColor={theme.primary600} strokeWidth={4} />
        <Marker coordinate={start} title="Start and finish" pinColor={theme.orange} />
      </MapView>
    </View>
  );
}
