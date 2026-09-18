import { ActivityIndicator } from 'react-native';

import { PressableScale } from './motion';
import { Text } from './typography';

/**
 * Bouton d'action principal : plein, couleur encre (la couleur du moment reste réservée aux
 * accents). `tone="primary"` le met dans la couleur du moment pour une action mise en avant.
 */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  className = '',
  tone = 'ink',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  tone?: 'ink' | 'primary';
}) {
  const fill = tone === 'ink' ? 'bg-ink' : 'bg-primary';
  const textColor = tone === 'ink' ? 'text-paper' : 'text-on-primary';
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      feedback="medium"
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      className={`items-center rounded-full px-5 py-4 ${fill} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator className={textColor} />
      ) : (
        <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold' }} className={`text-center text-base ${textColor}`}>
          {label}
        </Text>
      )}
    </PressableScale>
  );
}
