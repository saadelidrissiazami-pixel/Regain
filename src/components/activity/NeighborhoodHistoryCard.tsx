import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import {
  LocationPermissionDeniedError,
  fetchWikipediaSummary,
  reverseGeocode,
  requestAndGetLocation,
} from '../../lib/location';
import { useTheme } from '../../theme/ThemeProvider';
import { InlineNotice } from '../feedback/InlineNotice';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

export function NeighborhoodHistoryCard() {
  const theme = useTheme();
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
        setErrorMessage("Impossible d'identifier ton quartier à partir de ta position.");
        setStatus('error');
        return;
      }

      let summary = null;
      for (const candidate of candidates) {
        summary = await fetchWikipediaSummary(candidate);
        if (summary) break;
      }

      setPlaceLabel(candidates[0]);
      setExtract(summary ? summary.extract : null);
      setStatus('done');
    } catch (err) {
      setErrorMessage(
        err instanceof LocationPermissionDeniedError
          ? "Localisation refusée : active-la dans les réglages pour découvrir l'histoire de ton quartier."
          : 'Impossible de récupérer ces informations pour le moment. Réessaie dans un instant.'
      );
      setStatus('error');
    }
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Text variant="overline" tone="ink2">
        🏙️ Histoire de ton quartier
      </Text>
      {status === 'idle' ? (
        <>
          <Text variant="bodySm" tone="ink2" style={{ marginTop: 8, marginBottom: 12 }}>
            On utilise ta position pour te raconter un peu de l&apos;histoire du quartier ou de la ville que tu vas explorer.
          </Text>
          <Button label="Découvrir mon quartier" variant="secondary" size="md" fullWidth={false} icon="location-outline" onPress={handleDiscover} />
        </>
      ) : status === 'loading' ? (
        <View style={{ paddingVertical: 12 }}>
          <ActivityIndicator color={theme.primary600} />
        </View>
      ) : status === 'error' ? (
        <>
          <InlineNotice tone="error" message={errorMessage} />
          <Button label="Réessayer" variant="ghost" size="sm" fullWidth={false} onPress={handleDiscover} style={{ marginTop: 6 }} />
        </>
      ) : (
        <>
          <Text variant="label" style={{ marginTop: 8 }}>
            {placeLabel}
          </Text>
          <Text variant="bodySm" tone="ink2" style={{ marginTop: 6 }}>
            {extract ?? "Pas d'article disponible pour ce lieu précis : c'est peut-être l'occasion de partir à sa découverte."}
          </Text>
          <Text variant="caption" tone="ink3" style={{ marginTop: 8 }}>
            Source : Wikipédia.
          </Text>
        </>
      )}
    </Card>
  );
}
