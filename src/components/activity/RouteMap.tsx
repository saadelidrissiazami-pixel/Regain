import { useRef } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import type { Coords } from '../../lib/location';

// Version mobile (iOS : Apple Maps, sans clé). Le web utilise RouteMap.web.tsx, react-native-maps
// n'ayant pas d'implémentation navigateur.
export function RouteMap({ path, start }: { path: Coords[]; start: Coords }) {
  const mapRef = useRef<MapView>(null);

  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-line" style={{ height: 260 }}>
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
        <Polyline coordinates={path} strokeColor="#FF6B57" strokeWidth={4} />
        <Marker coordinate={start} title="Départ et arrivée" pinColor="#1E9C86" />
      </MapView>
    </View>
  );
}
