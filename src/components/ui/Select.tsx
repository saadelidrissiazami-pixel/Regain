import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { Button } from './Button';
import { haptic, PressableScale } from './motion';
import { Sheet } from './Sheet';
import { Text } from './Text';

export type SelectOption<T extends string | number> = {
  value: T;
  label: string;
  /** Detail shown under the label (“3 to 5 sessions a week”). */
  hint?: string;
  /** A section title inside the list (“Morning”, “Evening”…). */
  group?: string;
};

const ROW_HEIGHT = 58;
const GROUP_HEIGHT = 34;

function Row({
  option,
  selected,
  multiple,
  onPress,
}: {
  option: SelectOption<string | number>;
  selected: boolean;
  multiple?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={multiple ? 'checkbox' : 'radio'}
      accessibilityState={{ selected, checked: selected }}
      style={{
        minHeight: ROW_HEIGHT - 4,
        marginHorizontal: 12,
        marginBottom: 4,
        paddingHorizontal: 16,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: selected ? theme.sage100 : theme.surface,
      }}
    >
      <View style={{ flex: 1, paddingRight: 12, paddingVertical: 8 }}>
        <Text variant="label" tone="inherit" style={{ color: selected ? theme.primary700 : theme.ink }}>
          {option.label}
        </Text>
        {option.hint ? (
          <Text variant="caption" tone="ink2">
            {option.hint}
          </Text>
        ) : null}
      </View>
      {selected ? <Ionicons name={multiple ? 'checkbox' : 'checkmark-circle'} size={22} color={theme.primary600} /> : null}
      {!selected && multiple ? <Ionicons name="square-outline" size={22} color={theme.ink3} /> : null}
    </Pressable>
  );
}

function Field({
  label,
  value,
  hint,
  placeholder,
  onPress,
}: {
  label: string;
  value?: string;
  hint?: string;
  placeholder: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      feedback="selection"
      accessibilityRole="button"
      accessibilityLabel={`${label} : ${value ?? placeholder}`}
      style={{
        marginBottom: 12,
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.line,
        backgroundColor: theme.surface,
        paddingHorizontal: 16,
        paddingVertical: 10,
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text variant="caption" tone="ink2">
          {label}
        </Text>
        <Text variant="bodyStrong" tone={value ? 'ink' : 'ink3'} style={{ marginTop: 1 }}>
          {value ?? placeholder}
        </Text>
        {hint ? (
          <Text variant="caption" tone="ink2">
            {hint}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-down" size={20} color={theme.ink3} />
    </PressableScale>
  );
}

/** Where to open the list so the chosen option is visible. */
function offsetOfSelected<T extends string | number>(options: SelectOption<T>[], index: number): number {
  if (index <= 2) return 0;
  let y = 0;
  let lastGroup: string | undefined;
  for (let i = 0; i < index; i++) {
    if (options[i].group && options[i].group !== lastGroup) {
      y += GROUP_HEIGHT;
      lastGroup = options[i].group;
    }
    y += ROW_HEIGHT;
  }
  return Math.max(0, y - ROW_HEIGHT * 2);
}

/** Gives each option the section title to show above it, when that changes. */
function withHeaders<T extends string | number>(options: SelectOption<T>[]) {
  let lastGroup: string | undefined;
  const rows: { option: SelectOption<T>; header: string | null }[] = [];
  for (const option of options) {
    rows.push({ option, header: option.group && option.group !== lastGroup ? option.group : null });
    lastGroup = option.group;
  }
  return rows;
}

function GroupedRows<T extends string | number>({
  options,
  isSelected,
  multiple,
  onSelect,
}: {
  options: SelectOption<T>[];
  isSelected: (value: T) => boolean;
  multiple?: boolean;
  onSelect: (value: T) => void;
}) {
  return (
    <>
      {withHeaders(options).map(({ option, header }) => (
        <View key={String(option.value)}>
          {header ? (
            <Text variant="overline" tone="ink2" style={{ height: GROUP_HEIGHT, paddingHorizontal: 20, paddingTop: 10 }}>
              {header}
            </Text>
          ) : null}
          <Row option={option} selected={isSelected(option.value)} multiple={multiple} onPress={() => onSelect(option.value)} />
        </View>
      ))}
    </>
  );
}

/** A single-choice field: opens a list from the bottom of the screen. */
export function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Choose',
  title,
  subtitle,
}: {
  label: string;
  value: T | null | undefined;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  title?: string;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const index = options.findIndex((option) => option.value === value);
  const selected = index >= 0 ? options[index] : null;

  return (
    <>
      <Field label={label} value={selected?.label} hint={selected?.hint} placeholder={placeholder} onPress={() => setOpen(true)} />
      <Sheet
        visible={open}
        title={title ?? label}
        subtitle={subtitle}
        onClose={() => setOpen(false)}
        scrollToY={offsetOfSelected(options, index)}
      >
        <GroupedRows
          options={options}
          isSelected={(v) => v === value}
          onSelect={(v) => {
            haptic.selection();
            onChange(v);
            setOpen(false);
          }}
        />
      </Sheet>
    </>
  );
}

/** A multiple-choice field: the list stays open until “Done”. */
export function SelectMulti<T extends string>({
  label,
  values,
  options,
  onChange,
  placeholder = 'Choose',
  title,
  subtitle,
}: {
  label: string;
  values: T[];
  options: SelectOption<T>[];
  onChange: (values: T[]) => void;
  placeholder?: string;
  title?: string;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const chosen = options.filter((option) => values.includes(option.value));
  const summary = chosen.length === 0 ? undefined : chosen.map((option) => option.label).join(' · ');

  return (
    <>
      <Field
        label={label}
        value={summary}
        hint={chosen.length > 1 ? `${chosen.length} selected` : undefined}
        placeholder={placeholder}
        onPress={() => setOpen(true)}
      />
      <Sheet
        visible={open}
        title={title ?? label}
        subtitle={subtitle ?? 'You can choose more than one'}
        onClose={() => setOpen(false)}
        footer={<Button label="Done" onPress={() => setOpen(false)} />}
      >
        <GroupedRows
          options={options}
          multiple
          isSelected={(v) => values.includes(v)}
          onSelect={(v) => {
            haptic.selection();
            onChange(values.includes(v) ? values.filter((current) => current !== v) : [...values, v]);
          }}
        />
      </Sheet>
    </>
  );
}
