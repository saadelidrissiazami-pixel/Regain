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
import { decimal, t } from '../../lib/i18n';

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
      // If the routing service does not answer (network, quota), keep an indicative loop drawn by
      // compass rather than leaving the user with nothing.
      setResult(
        route.status === 'fulfilled'
          ? { kind: 'route', start, route: route.value }
          : { kind: 'compass', legs: generateWalkingLoop(start, durationMinutes) }
      );
      setStatus('done');
    } catch (err) {
      setErrorMessage(
        err instanceof LocationPermissionDeniedError
          ? t('Location declined. You can turn it on in Settings to get a route.')
          : t('Could not build the route right now. Try again in a moment.')
      );
      setStatus('error');
    }
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Text variant="overline" tone="ink2">
        🧭 {t('A walking route near you')}
      </Text>

      {status === 'idle' ? (
        <>
          <Text variant="bodySm" tone="ink2" style={{ marginTop: 8, marginBottom: 12 }}>
            {t('We trace a loop through the streets around you, sized to this activity, with a map and step-by-step directions.')}
          </Text>
          <Button label={t('Build my route')} variant="secondary" size="md" fullWidth={false} icon="navigate-outline" onPress={handleLocate} />
        </>
      ) : status === 'loading' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }}>
          <ActivityIndicator color={theme.primary600} />
          <Text variant="bodySm" tone="ink2" style={{ flex: 1 }}>
            {t('Adjusting the route to fit {minutes} min…', { minutes: durationMinutes })}
          </Text>
        </View>
      ) : status === 'error' ? (
        <>
          <InlineNotice tone="error" message={errorMessage} />
          <Button label={t('Try again')} variant="ghost" size="sm" fullWidth={false} onPress={handleLocate} style={{ marginTop: 6 }} />
        </>
      ) : result?.kind === 'route' ? (
        <View style={{ marginTop: 12 }}>
          <RouteMap path={result.route.path} start={result.start} />
          <Text variant="cardTitle" tabular>
            {t('{km} km · about {minutes} min', { km: decimal(result.route.distanceM / 1000), minutes: Math.round(result.route.durationS / 60) })}
          </Text>
          <Text variant="caption" tone="ink2" style={{ marginTop: 2, marginBottom: 12 }}>
            {t('A loop from {start} and back to the same place, to fit within {minutes} min.', { start: startLabel ?? t('where you are'), minutes: durationMinutes })}
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
          <Button label={t('Another loop')} variant="outline" size="sm" fullWidth={false} icon="refresh" onPress={handleLocate} style={{ marginTop: 6 }} />
          <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
            <Text variant="caption" tone="ink3">
              {t('Route © OpenStreetMap contributors')} ·{' '}
            </Text>
            <TextLink label={t('Report a map error')} icon={null} tone="ink2" onPress={() => Linking.openURL(FIX_THE_MAP_URL)} />
          </View>
        </View>
      ) : (
        <View style={{ marginTop: 10 }}>
          <Text variant="caption" tone="ink2" style={{ marginBottom: 10 }}>
            {t('Step-by-step directions are unavailable right now. Here is an indicative loop from {start}.', { start: startLabel ?? t('where you are') })}
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
          <Button label={t('Try again')} variant="outline" size="sm" fullWidth={false} onPress={handleLocate} style={{ marginTop: 6 }} />
        </View>
      )}
    </Card>
  );
}
