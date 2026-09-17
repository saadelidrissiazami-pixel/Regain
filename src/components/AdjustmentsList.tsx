import { View } from 'react-native';

import { Appear } from './motion';
import { Text } from './typography';
import type { PlanAdjustment } from '../features/fitness/planDiff';

/** Ce que le dernier bilan a changé : une ligne par ajustement. */
export function AdjustmentsList({ adjustments }: { adjustments: PlanAdjustment[] }) {
  return (
    <>
      {adjustments.map((adjustment, i) => (
        <Appear key={adjustment.label} index={i}>
          <View className={`flex-row ${i === adjustments.length - 1 ? '' : 'mb-3'}`}>
            <Text className="mr-3 text-lg">{adjustment.icon}</Text>
            <View className="flex-1">
              <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-sm text-ink">
                {adjustment.label}
              </Text>
              {adjustment.detail ? <Text className="mt-0.5 text-xs text-ink-soft">{adjustment.detail}</Text> : null}
            </View>
          </View>
        </Appear>
      ))}
    </>
  );
}
