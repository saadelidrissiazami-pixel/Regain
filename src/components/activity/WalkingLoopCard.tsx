import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Text } from '../typography';
import {
  LocationPermissionDeniedError,
  generateWalkingLoop,
  reverseGeocode,
  requestAndGetLocation,
  type WalkingLeg,
} from '../../lib/location';

export function WalkingLoopCard({ durationMinutes }: { durationMinutes: number }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');
  const [legs, setLegs] = useState<WalkingLeg[]>([]);
  const [startLabel, setStartLabel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLocate = async () => {
    setStatus('loading');
    try {
      const coords = await requestAndGetLocation();
      const [place] = await Promise.all([reverseGeocode(coords)]);
      setStartLabel(place.road ?? place.neighbourhood ?? place.city ?? 'votre position');
      setLegs(generateWalkingLoop(coords, durationMinutes));
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
            On génère une boucle de marche adaptée à la durée de cette activité, à partir de votre position actuelle.
          </Text>
          <Pressable onPress={handleLocate} className="self-start rounded-full bg-primary px-4 py-2.5">
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-sm text-white">
              Générer mon itinéraire
            </Text>
          </Pressable>
        </>
      ) : status === 'loading' ? (
        <ActivityIndicator color="#FF6B57" />
      ) : status === 'error' ? (
        <Text className="text-sm text-ink-soft">{errorMessage}</Text>
      ) : (
        <>
          <Text className="mb-3 text-xs text-ink-soft">Départ estimé : {startLabel}</Text>
          {legs.map((leg, i) => (
            <View key={i} className="mb-2 flex-row items-start">
              <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mr-2 text-sm text-primary">
                {i + 1}.
              </Text>
              <Text className="flex-1 text-sm leading-5 text-ink-soft">{leg.instruction}</Text>
            </View>
          ))}
          <Text className="mt-2 text-[11px] text-ink-soft">
            Boucle indicative générée à partir de votre position — adaptez le trajet selon les rues et passages
            piétons réels.
          </Text>
        </>
      )}
    </View>
  );
}
