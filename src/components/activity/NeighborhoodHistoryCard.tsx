import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Text } from '../typography';
import {
  LocationPermissionDeniedError,
  fetchWikipediaSummary,
  reverseGeocode,
  requestAndGetLocation,
} from '../../lib/location';

export function NeighborhoodHistoryCard() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');
  const [placeLabel, setPlaceLabel] = useState('');
  const [extract, setExtract] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDiscover = async () => {
    setStatus('loading');
    try {
      const coords = await requestAndGetLocation();
      const place = await reverseGeocode(coords);
      const candidates = [place.neighbourhood, place.city].filter((v): v is string => !!v);

      if (candidates.length === 0) {
        setErrorMessage("Impossible d'identifier votre quartier à partir de votre position.");
        setStatus('error');
        return;
      }

      let summary = null;
      for (const candidate of candidates) {
        summary = await fetchWikipediaSummary(candidate);
        if (summary) break;
      }

      setPlaceLabel(candidates[0]);
      if (summary) {
        setExtract(summary.extract);
      } else {
        setExtract(null);
      }
      setStatus('done');
    } catch (err) {
      setErrorMessage(
        err instanceof LocationPermissionDeniedError
          ? "Localisation refusée — activez-la dans les réglages pour découvrir l'histoire de votre quartier."
          : "Impossible de récupérer ces informations pour le moment."
      );
      setStatus('error');
    }
  };

  return (
    <View className="mb-6 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="mb-2.5 text-sm text-ink">
        🏙️ Histoire de votre quartier
      </Text>

      {status === 'idle' ? (
        <>
          <Text className="mb-3 text-sm text-ink-soft">
            On identifie votre position pour vous raconter un peu de l'histoire du quartier ou de la ville que vous
            allez explorer.
          </Text>
          <Pressable onPress={handleDiscover} className="self-start rounded-full bg-primary px-4 py-2.5">
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-sm text-white">
              Découvrir mon quartier
            </Text>
          </Pressable>
        </>
      ) : status === 'loading' ? (
        <ActivityIndicator color="#FF6B57" />
      ) : status === 'error' ? (
        <Text className="text-sm text-ink-soft">{errorMessage}</Text>
      ) : (
        <>
          <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mb-1.5 text-sm text-ink">
            {placeLabel}
          </Text>
          {extract ? (
            <Text className="text-sm leading-5 text-ink-soft">{extract}</Text>
          ) : (
            <Text className="text-sm text-ink-soft">
              Pas d'article disponible pour ce lieu précis — c'est peut-être l'occasion de partir à sa découverte par
              vous-même.
            </Text>
          )}
          <Text className="mt-2 text-[11px] text-ink-soft">Source : Wikipédia.</Text>
        </>
      )}
    </View>
  );
}
