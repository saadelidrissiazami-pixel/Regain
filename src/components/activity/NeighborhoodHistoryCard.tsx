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
import { t } from '../../lib/i18n';

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
        setErrorMessage(t('Could not work out your neighbourhood from your location.'));
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
          ? t('Location declined. Turn it on in Settings to read about your neighbourhood.')
          : t('Could not fetch this right now. Try again in a moment.')
      );
      setStatus('error');
    }
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Text variant="overline" tone="ink2">
        🏙️ {t('The story of your neighbourhood')}
      </Text>
      {status === 'idle' ? (
        <>
          <Text variant="bodySm" tone="ink2" style={{ marginTop: 8, marginBottom: 12 }}>
            {t('We use your location to tell you a little of the history of the area or town you are about to explore.')}
          </Text>
          <Button label={t('Read about my area')} variant="secondary" size="md" fullWidth={false} icon="location-outline" onPress={handleDiscover} />
        </>
      ) : status === 'loading' ? (
        <View style={{ paddingVertical: 12 }}>
          <ActivityIndicator color={theme.primary600} />
        </View>
      ) : status === 'error' ? (
        <>
          <InlineNotice tone="error" message={errorMessage} />
          <Button label={t('Try again')} variant="ghost" size="sm" fullWidth={false} onPress={handleDiscover} style={{ marginTop: 6 }} />
        </>
      ) : (
        <>
          <Text variant="label" style={{ marginTop: 8 }}>
            {placeLabel}
          </Text>
          <Text variant="bodySm" tone="ink2" style={{ marginTop: 6 }}>
            {extract ?? t('No article for this exact spot — which may be reason enough to go and see it.')}
          </Text>
          <Text variant="caption" tone="ink3" style={{ marginTop: 8 }}>
            {t('Source: Wikipedia.')}
          </Text>
        </>
      )}
    </Card>
  );
}
