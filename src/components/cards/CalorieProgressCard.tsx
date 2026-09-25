import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import type { NutritionLog } from '../../hooks/useNutritionLog';
import { t } from '../../lib/i18n';
import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/motion';
import { Text } from '../ui/Text';

/**
 * The day's calories against the target.
 *
 * The line under the bar changes with how the day is going, and one case is deliberately flat:
 * past the target it states the number and stops. An app that scolds somebody for eating is an
 * app that does harm, and the target is an estimate in the first place.
 */
function summaryOf(log: NutritionLog): string {
  // A failed read must not look like an empty day: both would otherwise show "nothing noted yet",
  // and somebody would add their lunch a second time.
  if (log.isError) return t('Today could not be loaded.');
  switch (log.status) {
    case 'empty':
      return t('Nothing noted yet today.');
    case 'under':
    case 'close':
      return t('{count} kcal to go.', { count: log.remainingKcal });
    case 'met':
      return t('Target reached for today.');
    case 'over':
      return t('{count} kcal noted today.', { count: log.totals.calories });
  }
}

export function CalorieProgressCard({ log, onAdd }: { log: NutritionLog; onAdd: () => void }) {
  const theme = useTheme();
  const ratio = log.target > 0 ? Math.min(1, log.totals.calories / log.target) : 0;
  const met = log.status === 'met' || log.status === 'over';

  return (
    <Card
      padding={16}
      accessibilityLabel={t('{consumed} of {target} kcal today', { consumed: log.totals.calories, target: log.target })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: theme.sage100,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name={met ? 'checkmark-circle-outline' : 'restaurant-outline'} size={20} color={theme.primary600} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="label">{t('Today on your plate')}</Text>
          <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
            {summaryOf(log)}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text variant="caption" tone="ink2" tabular>
          {t('{consumed} / {target} kcal', { consumed: log.totals.calories, target: log.target })}
        </Text>
        <View style={{ flex: 1 }}>
          <ProgressBar progress={ratio} height={6} />
        </View>
      </View>

      {/* The three macronutrients under the calories, each against the target the profile already
          implies. They are read-outs, not a second set of bars: four bars on one card turn a
          glance into a reading exercise, and calories are the number that carries the day. */}
      {log.proteinTarget > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 2, marginTop: 8 }}>
          <Text variant="caption" tone="ink2" tabular>
            {t('{name} {consumed} / {target} g', {
              name: t('prot'),
              consumed: log.totals.proteinG,
              target: log.proteinTarget,
            })}
          </Text>
          <Text variant="caption" tone="ink2" tabular>
            {t('{name} {consumed} / {target} g', {
              name: t('carbs'),
              consumed: log.totals.carbsG,
              target: log.carbsTarget,
            })}
          </Text>
          <Text variant="caption" tone="ink2" tabular>
            {t('{name} {consumed} / {target} g', {
              name: t('fat'),
              consumed: log.totals.fatG,
              target: log.fatTarget,
            })}
          </Text>
        </View>
      ) : null}

      {/* Only once the day is nearly there: naming two foods is useful when a snack closes the
          gap, and useless when half the day is still to come. */}
      {log.status === 'close' && log.complements.length > 0 ? (
        <View style={{ marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: theme.sage100 }}>
          <Text variant="caption" style={{ fontWeight: '700' }}>
            {t('Nearly there — this would close the gap')}
          </Text>
          {log.complements.map((c) => (
            <Text key={c.id} variant="caption" tone="ink2" style={{ marginTop: 4 }}>
              {t('{grams} g {food} · {calories} kcal, {protein} g protein', {
                grams: c.grams,
                food: c.name,
                calories: c.calories,
                protein: c.proteinG,
              })}
            </Text>
          ))}
        </View>
      ) : null}

      <Button label={t('Add what I ate')} icon="add" variant="secondary" onPress={onAdd} style={{ marginTop: 14 }} />
    </Card>
  );
}
