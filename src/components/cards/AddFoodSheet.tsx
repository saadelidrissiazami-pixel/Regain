import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';

import type { NutritionLog } from '../../hooks/useNutritionLog';
import { t } from '../../lib/i18n';
import { useTheme } from '../../theme/ThemeProvider';
import { errorMessage, InlineNotice } from '../feedback/InlineNotice';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

/** Digits only, and nothing absurd: the column is checked at 0-10000 in the database too. */
function parseNumber(value: string, max: number): number | null {
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) && n >= 0 && n <= max ? n : null;
}

export function AddFoodSheet({
  log,
  visible,
  onClose,
  onScan,
}: {
  log: NutritionLog;
  visible: boolean;
  onClose: () => void;
  onScan?: () => void;
}) {
  const theme = useTheme();
  const [label, setLabel] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');

  const kcal = parseNumber(calories, 10000);
  const proteinG = protein.trim() ? parseNumber(protein, 500) : null;
  const canSave = label.trim().length > 0 && kcal !== null && kcal > 0 && !log.adding;

  const save = () => {
    if (!canSave || kcal === null) return;
    log.add({ label, calories: kcal, proteinG });
    setLabel('');
    setCalories('');
    setProtein('');
  };

  return (
    <Sheet
      visible={visible}
      title={t('What did you eat?')}
      onClose={onClose}
      footer={
        <View style={{ gap: 8 }}>
          <Button label={t('Add')} icon="add" onPress={save} disabled={!canSave} loading={log.adding} />
          <Button label={t('Close')} variant="ghost" onPress={onClose} />
        </View>
      }
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        {onScan ? (
          <Button
            label={t('Estimate from a photo')}
            icon="camera-outline"
            variant="outline"
            onPress={onScan}
            style={{ marginBottom: 16 }}
          />
        ) : null}

        <Field
          label={t('Food')}
          value={label}
          onChangeText={setLabel}
          placeholder={t('Chicken and rice')}
          returnKeyType="next"
        />
        <Field
          label={t('Calories (kcal)')}
          value={calories}
          onChangeText={setCalories}
          keyboardType="number-pad"
          placeholder="450"
        />
        <Field
          label={t('Protein (g) — optional')}
          value={protein}
          onChangeText={setProtein}
          keyboardType="number-pad"
          placeholder="30"
        />

        {log.addError ? <InlineNotice tone="error" message={errorMessage(log.addError)} /> : null}

        {log.entries.length > 0 ? (
          <View style={{ marginTop: 8 }}>
            <Text variant="overline" tone="ink2" style={{ marginBottom: 8 }}>
              {t('Noted today')}
            </Text>
            {log.entries.map((entry) => (
              <View
                key={entry.id}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="body">{entry.label}</Text>
                  <Text variant="caption" tone="ink2" tabular>
                    {entry.protein_g != null
                      ? t('{calories} kcal · {protein} g protein', { calories: entry.calories, protein: entry.protein_g })
                      : t('{calories} kcal', { calories: entry.calories })}
                    {/* A photo estimate says so, so a wrong number can be recognised as a guess. */}
                    {entry.source === 'photo' ? ` · ${t('from a photo')}` : ''}
                  </Text>
                </View>
                <Ionicons
                  name="close-circle-outline"
                  size={22}
                  color={theme.ink3}
                  onPress={() => log.remove(entry.id)}
                  accessibilityRole="button"
                  accessibilityLabel={t('Remove {food}', { food: entry.label })}
                />
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Sheet>
  );
}
