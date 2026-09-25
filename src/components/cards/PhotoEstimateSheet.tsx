import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';

import type { NutritionLog } from '../../hooks/useNutritionLog';
import { t } from '../../lib/i18n';
import {
  estimateFromPhoto,
  pickMealPhoto,
  takeMealPhoto,
  type PhotoEstimateItem,
} from '../../lib/nutritionPhoto';
import { useTheme } from '../../theme/ThemeProvider';
import { errorMessage, InlineNotice } from '../feedback/InlineNotice';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

type Phase = 'choose' | 'working' | 'review';

/**
 * A photo becomes a list of foods the person confirms — never rows written behind their back.
 *
 * An estimate from a photograph is a guess: the portion is judged from a flat image, and the
 * model cannot see the oil in the pan. So nothing is saved until it has been read, anything
 * wrong can be dropped first, and what is saved is marked as coming from a photo.
 */
export function PhotoEstimateSheet({
  log,
  visible,
  onClose,
}: {
  log: NutritionLog;
  visible: boolean;
  onClose: () => void;
}) {
  const theme = useTheme();
  const [phase, setPhase] = useState<Phase>('choose');
  const [items, setItems] = useState<PhotoEstimateItem[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<unknown>(null);

  const reset = () => {
    setPhase('choose');
    setItems([]);
    setNote('');
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const run = async (source: 'camera' | 'library') => {
    setError(null);
    try {
      const startedAt = Date.now();
      const photo = source === 'camera' ? await takeMealPhoto() : await pickMealPhoto();
      if (!photo) {
        // Backing out of the picker is not a failure and deserves no message. But a picker that
        // returns before anyone could have tapped anything never opened at all — a simulator has
        // no camera, and the failure is silent. Saying nothing there looks like a broken button.
        // ponytail: a 800ms threshold rather than a real capability check; expo-image-picker
        // exposes none, and expo-device would be another native module for one boolean.
        if (source === 'camera' && Date.now() - startedAt < 800) {
          setError(new Error(t('The camera did not open. On a simulator there is none — choose an existing photo instead.')));
        }
        return;
      }
      setPhase('working');
      const estimate = await estimateFromPhoto(photo);
      setItems(estimate.items);
      setNote(estimate.note);
      setPhase('review');
    } catch (e) {
      setError(e);
      setPhase('choose');
    }
  };

  const total = items.reduce((sum, item) => sum + item.calories, 0);

  const saveAll = () => {
    for (const item of items) {
      log.add({ label: item.label, calories: item.calories, proteinG: item.protein_g, source: 'photo' });
    }
    close();
  };

  return (
    <Sheet
      visible={visible}
      title={t('Estimate from a photo')}
      onClose={close}
      footer={
        phase === 'review' ? (
          <View style={{ gap: 8 }}>
            <Button
              label={items.length > 0 ? t('Add these {count} foods', { count: items.length }) : t('Close')}
              icon={items.length > 0 ? 'add' : undefined}
              onPress={items.length > 0 ? saveAll : close}
              loading={log.adding}
            />
            <Button label={t('Take another photo')} variant="ghost" onPress={reset} />
          </View>
        ) : (
          <Button label={t('Close')} variant="ghost" onPress={close} />
        )
      }
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        {phase === 'choose' ? (
          <>
            <Text variant="caption" tone="ink2" style={{ marginBottom: 16 }}>
              {t('A photo gives an estimate, not a measurement. You can correct every line before it is saved.')}
            </Text>
            <Button label={t('Take a photo')} icon="camera-outline" onPress={() => run('camera')} />
            <Button
              label={t('Choose from my photos')}
              icon="images-outline"
              variant="outline"
              onPress={() => run('library')}
              style={{ marginTop: 10 }}
            />
          </>
        ) : null}

        {phase === 'working' ? (
          <Text variant="body" tone="ink2">
            {t('Reading the photo…')}
          </Text>
        ) : null}

        {phase === 'review' ? (
          items.length === 0 ? (
            <Text variant="body" tone="ink2">
              {t('No food could be made out in that photo. Try another one, or add it by hand.')}
            </Text>
          ) : (
            <>
              {items.map((item, index) => (
                <View
                  key={`${item.label}-${index}`}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="body">{item.label}</Text>
                    <Text variant="caption" tone="ink2" tabular>
                      {t('{calories} kcal · {protein} g protein', { calories: item.calories, protein: item.protein_g })}
                    </Text>
                  </View>
                  <Ionicons
                    name="close-circle-outline"
                    size={22}
                    color={theme.ink3}
                    onPress={() => setItems((list) => list.filter((_, i) => i !== index))}
                    accessibilityRole="button"
                    accessibilityLabel={t('Remove {food}', { food: item.label })}
                  />
                </View>
              ))}
              <Text variant="label" tabular style={{ marginTop: 8 }}>
                {t('{count} kcal in total', { count: total })}
              </Text>
              {note ? (
                <Text variant="caption" tone="ink2" style={{ marginTop: 6 }}>
                  {note}
                </Text>
              ) : null}
            </>
          )
        ) : null}

        {error ? <InlineNotice tone="error" message={errorMessage(error)} /> : null}
      </View>
    </Sheet>
  );
}
