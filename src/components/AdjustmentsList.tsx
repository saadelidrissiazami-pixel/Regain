import { View } from 'react-native';

import { Appear } from './ui/motion';
import { Text } from './ui/Text';
import type { PlanAdjustment } from '../features/fitness/planDiff';

/** Ce que le dernier bilan a changé : une ligne par ajustement. */
export function AdjustmentsList({ adjustments }: { adjustments: PlanAdjustment[] }) {
  return (
    <>
      {adjustments.map((adjustment, i) => (
        <Appear key={adjustment.label} index={i}>
          <View style={{ flexDirection: 'row', marginBottom: i === adjustments.length - 1 ? 0 : 12 }}>
            <Text variant="bodyStrong" style={{ marginRight: 12 }}>
              {adjustment.icon}
            </Text>
            <View style={{ flex: 1 }}>
              <Text variant="label">{adjustment.label}</Text>
              {adjustment.detail ? (
                <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
                  {adjustment.detail}
                </Text>
              ) : null}
            </View>
          </View>
        </Appear>
      ))}
    </>
  );
}
