import { View } from 'react-native';

import type { NutritionTargets } from '../../features/fitness/nutrition';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { useAnimatedNumber } from '../ui/motion';
import { Text } from '../ui/Text';

export const STRATEGY_LABELS: Record<NutritionTargets['strategy'], string> = {
  deficit: 'Léger déficit — perte progressive',
  surplus: 'Léger surplus — prise de masse',
  maintien: 'Équilibre — entretien de la forme',
};

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <>
      {Math.round(useAnimatedNumber(value))}
      {suffix}
    </>
  );
}

/** Une macro : valeur en grammes sur fond teinté (protéines, glucides, lipides). */
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

/** Cibles du jour : calories, stratégie et macros. */
export function TargetsCard({ targets }: { targets: NutritionTargets }) {
  const theme = useTheme();
  return (
    <Card padding={18}>
      <Text variant="metric" tabular accessibilityLabel={`${targets.calories} kilocalories par jour`}>
        <CountUp value={targets.calories} suffix=" kcal" />
      </Text>
      <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
        {STRATEGY_LABELS[targets.strategy]}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        <MacroCard value={targets.proteinG} label="Protéines" background={theme.protein} />
        <MacroCard value={targets.carbsG} label="Glucides" background={theme.carbs} />
        <MacroCard value={targets.fatG} label="Lipides" background={theme.fat} />
      </View>
      {targets.floorApplied ? (
        <Text variant="caption" tone="ink2" style={{ marginTop: 10 }}>
          Cible relevée au seuil de sécurité : on ne descend jamais sous ton métabolisme de base.
        </Text>
      ) : null}
    </Card>
  );
}
