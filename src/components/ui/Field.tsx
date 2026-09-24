import { View, type TextInputProps } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { Text, TextInput } from './Text';

/** A text field with its label above and a hint or error message below. */
export function Field({
  label,
  hint,
  error,
  multiline,
  ...input
}: TextInputProps & { label?: string; hint?: string; error?: string }) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      {label ? (
        <Text variant="label" style={{ marginBottom: 8 }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        accessibilityLabel={label}
        multiline={multiline}
        {...input}
        style={[
          {
            minHeight: multiline ? 96 : 52,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: error ? theme.danger : theme.line,
            backgroundColor: theme.surface,
            paddingHorizontal: 16,
            paddingVertical: multiline ? 14 : 12,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          input.style,
        ]}
      />
      {error ? (
        <Text variant="caption" tone="danger" style={{ marginTop: 6 }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="ink2" style={{ marginTop: 6 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
