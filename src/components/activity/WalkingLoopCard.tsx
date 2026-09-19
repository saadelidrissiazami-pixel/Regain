import { useState } from 'react';
import { ActivityIndicator, Linking, View } from 'react-native';

import {
  LocationPermissionDeniedError,
  fetchLoopWithinDuration,
  generateWalkingLoop,
  requestAndGetLocation,
  reverseGeocode,
  type Coords,
  type WalkingLeg,
  type WalkingRoute,
} from '../../lib/location';
import { useTheme } from '../../theme/ThemeProvider';
import { InlineNotice } from '../feedback/InlineNotice';
import { Button, TextLink } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { RouteMap } from './RouteMap';

const FIX_THE_MAP_URL = 'https://www.openstreetmap.org/fixthemap';

type LoopResult = { kind: 'route'; start: Coords; route: WalkingRoute } | { kind: 'compass'; legs: WalkingLeg[] };

export function WalkingLoopCard({ durationMinutes }: { durationMinutes: number }) {
  const theme = useTheme();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');
  const [result, setResult] = useState<LoopResult | null>(null);
  const [startLabel, setStartLabel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLocate = async () => {
    setStatus('loading');
    try {
      const start = await requestAndGetLocation();
      const [place, route] = await Promise.allSettled([
        reverseGeocode(start),
        fetchLoopWithinDuration(start, durationMinutes),
      ]);

      setStartLabel(
        place.status === 'fulfilled' ? (place.value.road ?? place.value.neighbourhood ?? place.value.city) : null
      );
      // Si le service de routage ne répond pas (réseau, quota), on garde une boucle indicative
      // à la boussole plutôt que de laisser l'utilisateur sans rien.
      setResult(
        route.status === 'fulfilled'
          ? { kind: 'route', start, route: route.value }
          : { kind: 'compass', legs: generateWalkingLoop(start, durationMinutes) }
      );
      setStatus('done');
    } catch (err) {
      setErrorMessage(
        err instanceof LocationPermissionDeniedError
          ? "Localisation refusée : tu peux l'activer dans les réglages pour obtenir un itinéraire."
          : "Impossible de générer l'itinéraire pour le moment. Réessaie dans un instant."
      );
      setStatus('error');
    }
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Text variant="overline" tone="ink2">
        🧭 Itinéraire de marche près de toi
      </Text>

      {status === 'idle' ? (
        <>
          <Text variant="bodySm" tone="ink2" style={{ marginTop: 8, marginBottom: 12 }}>
            On trace une boucle sur les rues autour de toi, adaptée à la durée de cette activité, avec la carte et les indications pas à pas.
          </Text>
          <Button label="Générer mon itinéraire" variant="secondary" size="md" fullWidth={false} icon="navigate-outline" onPress={handleLocate} />
        </>
      ) : status === 'loading' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }}>
          <ActivityIndicator color={theme.primary600} />
          <Text variant="bodySm" tone="ink2" style={{ flex: 1 }}>
            Ajustement du parcours pour tenir en {durationMinutes} min…
          </Text>
        </View>
      ) : status === 'error' ? (
        <>
          <InlineNotice tone="error" message={errorMessage} />
          <Button label="Réessayer" variant="ghost" size="sm" fullWidth={false} onPress={handleLocate} style={{ marginTop: 6 }} />
        </>
      ) : result?.kind === 'route' ? (
        <View style={{ marginTop: 12 }}>
          <RouteMap path={result.route.path} start={result.start} />
          <Text variant="cardTitle" tabular>
            {(result.route.distanceM / 1000).toFixed(1).replace('.', ',')} km · environ {Math.round(result.route.durationS / 60)} min
          </Text>
          <Text variant="caption" tone="ink2" style={{ marginTop: 2, marginBottom: 12 }}>
            Boucle au départ de {startLabel ?? 'ta position'}, retour au même endroit, pour tenir en {durationMinutes} min maximum.
          </Text>
          {result.route.steps.map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
              <Text variant="label" tone="accent" tabular style={{ width: 26 }}>
                {i + 1}.
              </Text>
              <Text variant="bodySm" tone="ink2" style={{ flex: 1 }}>
                {step.instruction}
                {step.distanceM >= 1 ? ` · ${Math.round(step.distanceM)} m` : ''}
              </Text>
            </View>
          ))}
          <Button label="Autre boucle" variant="outline" size="sm" fullWidth={false} icon="refresh" onPress={handleLocate} style={{ marginTop: 6 }} />
          <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
            <Text variant="caption" tone="ink3">
              Itinéraire © contributeurs OpenStreetMap ·{' '}
            </Text>
            <TextLink label="Signaler une erreur de carte" icon={null} tone="ink2" onPress={() => Linking.openURL(FIX_THE_MAP_URL)} />
          </View>
        </View>
      ) : (
        <View style={{ marginTop: 10 }}>
          <Text variant="caption" tone="ink2" style={{ marginBottom: 10 }}>
            Itinéraire détaillé indisponible pour le moment : voici une boucle indicative depuis {startLabel ?? 'ta position'}.
          </Text>
          {result?.legs.map((leg, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
              <Text variant="label" tone="accent" style={{ width: 26 }}>
                {i + 1}.
              </Text>
              <Text variant="bodySm" tone="ink2" style={{ flex: 1 }}>
                {leg.instruction}
              </Text>
            </View>
          ))}
          <Button label="Réessayer" variant="outline" size="sm" fullWidth={false} onPress={handleLocate} style={{ marginTop: 6 }} />
        </View>
      )}
    </Card>
  );
}
