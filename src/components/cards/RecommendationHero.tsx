import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { themeLabel } from '../../features/wellbeing/catalogue';
import type { WellbeingRecommendation } from '../../features/wellbeing/recommend';
import { withAlpha } from '../../theme/colors';
import { imageForWellbeing } from '../../theme/images';
import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../ui/Button';
import { Text } from '../ui/Text';

const HEIGHT = 300;

function Slide({ item, width, onStart }: { item: WellbeingRecommendation; width: number; onStart: () => void }) {
  const theme = useTheme();
  const image = imageForWellbeing(item.program.category);
  return (
    <View style={{ width, height: HEIGHT, borderRadius: 24, overflow: 'hidden', backgroundColor: theme.sage100 }}>
      {image ? (
        <Image source={image} resizeMode="cover" style={{ position: 'absolute', width: '100%', height: '100%' }} accessibilityIgnoresInvertColors />
      ) : (
        <LinearGradient colors={[theme.sage100, theme.sage300]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', width: '100%', height: '100%' }} />
      )}
      {/* A scrim on the text side, so the title stays readable over any photo. */}
      <LinearGradient
        colors={[withAlpha(theme.scrim, 0.96), withAlpha(theme.scrim, 0.75), withAlpha(theme.scrim, 0)]}
        locations={[0, 0.5, 0.85]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      <View style={{ flex: 1, padding: 20, width: '72%', justifyContent: 'space-between' }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="sunny" size={16} color={theme.yellow} />
            <Text variant="caption" style={{ fontWeight: '700' }}>
              Recommended for you
            </Text>
          </View>
          <Text variant="headline" style={{ marginTop: 12 }} numberOfLines={3}>
            {item.program.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Ionicons name="headset-outline" size={14} color={theme.ink2} />
            <Text variant="overline" tone="ink2">
              {themeLabel(item.program.category)}
            </Text>
            <Text variant="caption" tone="ink2">
              · {item.program.duration_minutes} min
            </Text>
          </View>
          <Text variant="caption" tone="ink2" style={{ marginTop: 10 }} numberOfLines={3}>
            {item.reason}
          </Text>
        </View>
        <Button label="Start" icon="play" fullWidth={false} onPress={onStart} />
      </View>
    </View>
  );
}

/** What is recommended right now, as a paged carousel. */
export function RecommendationHero({
  items,
  width,
  onStart,
}: {
  items: WellbeingRecommendation[];
  width: number;
  onStart: (item: WellbeingRecommendation) => void;
}) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const gap = 12;
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / (width + gap));
    if (next !== page) setPage(next);
  };
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width + gap}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={32}
        style={{ marginHorizontal: -20 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap }}
        accessibilityLabel="Recommandations"
      >
        {items.map((item) => (
          <Slide key={item.program.id} item={item} width={width} onStart={() => onStart(item)} />
        ))}
      </ScrollView>
      {items.length > 1 ? (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 }} accessibilityElementsHidden>
          {items.map((item, i) => (
            <View
              key={item.program.id}
              style={{ width: i === page ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === page ? theme.primary600 : theme.sage300 }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
