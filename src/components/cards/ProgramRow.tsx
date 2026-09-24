import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { themeLabel } from '../../features/wellbeing/catalogue';
import type { WellbeingProgram } from '../../features/wellbeing/types';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { t } from '../../lib/i18n';

/** One session from the library: duration, title, and its state (done, Premium only). */
export function ProgramRow({
  program,
  done,
  locked,
  onPress,
  showCategory,
}: {
  program: WellbeingProgram;
  done: boolean;
  locked: boolean;
  onPress: () => void;
  showCategory?: boolean;
}) {
  const theme = useTheme();
  return (
    <Card
      padding={12}
      onPress={onPress}
      style={{ marginBottom: 10 }}
      accessibilityLabel={`${program.title}, ${program.duration_minutes} minutes${done ? ', already done' : ''}${locked ? ', Premium only' : ''}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: theme.sage100,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text variant="label" tone="inherit" tabular style={{ color: theme.primary700 }} maxFontSizeMultiplier={1.2}>
            {program.duration_minutes}′
          </Text>
        </View>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text variant="label" numberOfLines={2}>
            {program.title}
          </Text>
          <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
            {showCategory ? `${themeLabel(program.category)} · ` : ''}
            {program.duration_minutes} min{done ? t(' · done') : ''}
          </Text>
        </View>
        {locked ? (
          <Ionicons name="lock-closed" size={18} color={theme.premiumInk} />
        ) : done ? (
          <Ionicons name="checkmark-circle" size={20} color={theme.primary600} />
        ) : (
          <Ionicons name="chevron-forward" size={18} color={theme.ink3} />
        )}
      </View>
    </Card>
  );
}
