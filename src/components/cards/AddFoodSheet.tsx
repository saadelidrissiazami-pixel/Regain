import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';

import { amountsFor, foodName, macroSummary, searchFoods, type Food } from '../../features/fitness/foods';
import type { NutritionLog } from '../../hooks/useNutritionLog';
import { t } from '../../lib/i18n';
import { useTheme } from '../../theme/ThemeProvider';
import { errorMessage, InlineNotice } from '../feedback/InlineNotice';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { ListRow } from '../ui/ListRow';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

/** Digits only, and nothing absurd: the columns are checked in the database too. */
function parseNumber(value: string, max: number): number | null {
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) && n >= 0 && n <= max ? n : null;
}

/**
 * Noting a meal, with the four numbers coming from the food rather than from memory.
 *
 * Asking for carbohydrate and fat as well as calories is only reasonable if the app answers its
 * own question: nobody knows what 150 g of cooked lentils contains. So the person names the food,
 * the table proposes it, and saying roughly how much is the only arithmetic left.
 *
 * Typing the numbers by hand stays possible throughout, and is the only option for a plate the
 * table does not have — a family recipe, a canteen dish. Forcing every meal through a catalogue
 * would mean either a wrong match or nothing recorded at all.
 */
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
  const [picked, setPicked] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Nothing is proposed once a food is chosen, and nothing is proposed while the numbers are being
  // typed by hand — a list appearing under a field somebody has finished with is in the way.
  const suggestions = picked ? [] : searchFoods(label);
  const grams = picked ? parseNumber(quantity, 5000) : null;
  const amounts = picked && grams ? amountsFor(picked, grams) : null;

  const kcal = parseNumber(calories, 10000);
  const canSave = picked
    ? amounts !== null && amounts.calories > 0 && !log.adding
    : label.trim().length > 0 && kcal !== null && kcal > 0 && !log.adding;

  const clear = () => {
    setLabel('');
    setPicked(null);
    setQuantity('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  const choose = (food: Food) => {
    setPicked(food);
    setLabel(foodName(food));
    // Prefilled with one ordinary helping: most of the time it is right, and when it is not it is
    // a number to adjust rather than one to invent.
    setQuantity(String(food.portion));
  };

  const save = () => {
    if (!canSave) return;
    if (picked && amounts && grams) {
      // The quantity goes into the label: reading back “Chicken breast (150 g)” a week later says
      // where the numbers came from, and nothing else stores it.
      log.add({ label: `${foodName(picked)} (${grams} ${picked.unit})`, ...amounts });
    } else if (kcal !== null) {
      log.add({
        label,
        calories: kcal,
        proteinG: protein.trim() ? parseNumber(protein, 500) : null,
        carbsG: carbs.trim() ? parseNumber(carbs, 1000) : null,
        fatG: fat.trim() ? parseNumber(fat, 500) : null,
      });
    }
    clear();
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
          onChangeText={(text) => {
            setLabel(text);
            // Editing the name after choosing means the choice no longer describes what is there.
            if (picked) {
              setPicked(null);
              setQuantity('');
            }
          }}
          placeholder={t('Chicken breast, lentils, yoghurt…')}
          hint={picked ? undefined : t('Start typing: the values are filled in for you.')}
          returnKeyType="next"
        />

        {suggestions.length > 0 ? (
          <View style={{ marginTop: -8, marginBottom: 16 }}>
            {suggestions.map((food, index) => (
              <ListRow
                key={food.id}
                compact
                chevron={false}
                divider={index < suggestions.length - 1}
                icon="nutrition-outline"
                title={foodName(food)}
                subtitle={t('{count} kcal per 100 {unit}', { count: food.kcal, unit: food.unit })}
                onPress={() => choose(food)}
              />
            ))}
          </View>
        ) : null}

        {picked ? (
          <>
            <Field
              label={t('Quantity ({unit})', { unit: picked.unit })}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder={String(picked.portion)}
            />
            {amounts ? (
              <View style={{ padding: 12, borderRadius: 14, backgroundColor: theme.sage100, marginBottom: 16 }}>
                <Text variant="caption" style={{ fontWeight: '700' }}>
                  {t('That comes to')}
                </Text>
                <Text variant="caption" tone="ink2" tabular style={{ marginTop: 4 }}>
                  {macroSummary(amounts)}
                </Text>
              </View>
            ) : null}
          </>
        ) : (
          <>
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
            <Field
              label={t('Carbohydrate (g) — optional')}
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="number-pad"
              placeholder="50"
            />
            <Field
              label={t('Fat (g) — optional')}
              value={fat}
              onChangeText={setFat}
              keyboardType="number-pad"
              placeholder="15"
            />
          </>
        )}

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
                    {macroSummary({
                      calories: entry.calories,
                      proteinG: entry.protein_g,
                      carbsG: entry.carbs_g,
                      fatG: entry.fat_g,
                    })}
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
