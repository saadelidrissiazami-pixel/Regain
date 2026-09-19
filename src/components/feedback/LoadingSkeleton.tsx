import { View } from 'react-native';

import { Skeleton } from '../ui/motion';

/** Squelettes de chargement : la forme de l'écran apparaît avant ses données. */
export function LoadingSkeleton({ preset = 'cards' }: { preset?: 'cards' | 'list' | 'hero' | 'grid' }) {
  if (preset === 'hero') {
    return (
      <View accessibilityLabel="Chargement" accessible>
        <Skeleton height={240} style={{ borderRadius: 24 }} />
        <Skeleton height={20} style={{ width: 140, marginTop: 12 }} />
        <Skeleton height={96} />
      </View>
    );
  }
  if (preset === 'grid') {
    return (
      <View accessibilityLabel="Chargement" accessible style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} height={104} style={{ width: '31%', marginBottom: 0 }} />
        ))}
      </View>
    );
  }
  if (preset === 'list') {
    return (
      <View accessibilityLabel="Chargement" accessible>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={72} />
        ))}
      </View>
    );
  }
  return (
    <View accessibilityLabel="Chargement" accessible>
      <Skeleton height={64} />
      <Skeleton height={220} style={{ borderRadius: 24 }} />
      <Skeleton height={20} style={{ width: 120 }} />
      <Skeleton height={84} />
    </View>
  );
}
