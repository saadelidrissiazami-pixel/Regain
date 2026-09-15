import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, View } from 'react-native';

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
import { Text } from '../typography';
import { RouteMap } from './RouteMap';

const FIX_THE_MAP_URL = 'https://www.openstreetmap.org/fixthemap';

type LoopResult = { kind: 'route'; start: Coords; route: WalkingRoute } | { kind: 'compass'; legs: WalkingLeg[] };

export function WalkingLoopCard({ durationMinutes }: { durationMinutes: number }) {
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
          ? "Localisation refusée — vous pouvez l'activer dans les réglages pour obtenir un itinéraire."
          : "Impossible de générer l'itinéraire pour le moment."
      );
      setStatus('error');
    }
  };

  return (
    <View className="mb-6 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        🧭 Itinéraire de marche près de vous
      </Text>

      {status === 'idle' ? (
        <>
          <Text className="mb-3 text-sm text-ink-soft">
            On trace une boucle sur les rues autour de vous, adaptée à la durée de cette activité, avec la carte et
            les indications pas à pas.
          </Text>
          <Pressable onPress={handleLocate} className="self-start rounded-full bg-primary px-4 py-2.5">
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-sm text-white">
              Générer mon itinéraire
            </Text>
          </Pressable>
        </>
      ) : status === 'loading' ? (
        <View className="flex-row items-center">
          <ActivityIndicator color="#FF6B57" />
          <Text className="ml-2 text-sm text-ink-soft">
            Ajustement du parcours pour tenir en {durationMinutes} min…
          </Text>
        </View>
      ) : status === 'error' ? (
        <Text className="text-sm text-ink-soft">{errorMessage}</Text>
      ) : result?.kind === 'route' ? (
        <>
          <RouteMap path={result.route.path} start={result.start} />

          <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-base text-ink">
            {(result.route.distanceM / 1000).toFixed(1)} km · environ {Math.round(result.route.durationS / 60)} min
          </Text>
          <Text className="mb-3 text-xs text-ink-soft">
            Boucle au départ de {startLabel ?? 'votre position'}, retour au même endroit — ajustée pour tenir
            en {durationMinutes} min maximum.
          </Text>

          {result.route.steps.map((step, i) => (
            <View key={i} className="mb-2 flex-row items-start">
              <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mr-2 w-6 text-sm text-primary">
                {i + 1}.
              </Text>
              <Text className="flex-1 text-sm leading-5 text-ink-soft">
                {step.instruction}
                {step.distanceM >= 1 ? ` — ${Math.round(step.distanceM)} m` : ''}
              </Text>
            </View>
          ))}

          <Pressable onPress={handleLocate} className="mt-2 self-start rounded-full border border-line px-4 py-2">
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
              🔄 Autre boucle
            </Text>
          </Pressable>

          <View className="mt-3 flex-row flex-wrap items-center">
            <Text className="text-[11px] text-ink-soft">Itinéraire © contributeurs OpenStreetMap · </Text>
            <Pressable onPress={() => Linking.openURL(FIX_THE_MAP_URL)}>
              <Text className="text-[11px] text-ink-soft underline">Signaler une erreur de carte</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text className="mb-3 text-xs text-ink-soft">
            Itinéraire détaillé indisponible pour le moment — voici une boucle indicative depuis{' '}
            {startLabel ?? 'votre position'}.
          </Text>
          {result?.legs.map((leg, i) => (
            <View key={i} className="mb-2 flex-row items-start">
              <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mr-2 text-sm text-primary">
                {i + 1}.
              </Text>
              <Text className="flex-1 text-sm leading-5 text-ink-soft">{leg.instruction}</Text>
            </View>
          ))}
          <Pressable onPress={handleLocate} className="mt-2 self-start rounded-full border border-line px-4 py-2">
            <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
              Réessayer
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
