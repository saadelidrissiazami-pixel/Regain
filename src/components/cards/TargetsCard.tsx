import { View } from 'react-native';

import type { NutritionTargets } from '../../features/fitness/nutrition';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { useAnimatedNumber } from '../ui/motion';
import { Text } from '../ui/Text';

export const STRATEGY_LABELS: Record<NutritionTargets['strategy'], string> = {
  deficit: 'Slight deficit — gradual loss',
  surplus: 'Slight surplus — building mass',
  maintien: 'Balanced — maintaining',
};

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <>
      {Math.round(useAnimatedNumber(value))}
      {suffix}
    </>
  );
}

/** One macro: the value in grams on a tinted ground (protein, carbohydrate, fat). */
export function MacroCard({ value, label, background }: { value: number; label: string; background: string }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label} : ${value} grammes`}
      style={{ flex: 1, alignItems: 'center', borderRadius: 14, paddingVertical: 12, backgroundColor: background }}
    >
      <Text variant="cardTitle" tabular>
        <CountUp value={value} suffix=" g" />
      </Text>
      <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

/** Today's targets: calories, strategy and macros. */
export function TargetsCard({ targets }: { targets: NutritionTargets }) {
  const theme = useTheme();
  return (
    <Card padding={18}>
      <Text variant="metric" tabular accessibilityLabel={`${targets.calories} kilocalories per day`}>
        <CountUp value={targets.calories} suffix=" kcal" />
      </Text>
      <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
        {STRATEGY_LABELS[targets.strategy]}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        <MacroCard value={targets.proteinG} label="Protein" background={theme.protein} />
        <MacroCard value={targets.carbsG} label="Carbs" background={theme.carbs} />
        <MacroCard value={targets.fatG} label="Fat" background={theme.fat} />
      </View>
      {targets.floorApplied ? (
        <Text variant="caption" tone="ink2" style={{ marginTop: 10 }}>
          Raised to the safe floor: we never go below your basal metabolic rate.
        </Text>
      ) : null}
    </Card>
  );
}
