import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { haptic, PressableScale } from './motion';
import { Text } from './typography';

export type SelectOption<T extends string | number> = {
  value: T;
  label: string;
  /** Précision affichée sous le libellé (« 3 à 5 séances par semaine »). */
  hint?: string;
  /** Titre de section dans la liste (« Matin », « Soir »…). */
  group?: string;
};

const ROW_HEIGHT = 56;
const GROUP_HEIGHT = 34;

function SheetHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="px-5 pb-2 pt-3">
      <View className="mb-3 h-1 w-10 self-center rounded-full bg-line" />
      <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-lg text-ink">
        {title}
      </Text>
      {subtitle ? <Text className="mt-0.5 text-xs text-ink-soft">{subtitle}</Text> : null}
    </View>
  );
}

function Sheet({
  visible,
  title,
  subtitle,
  onClose,
  scrollToY,
  children,
  footer,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  scrollToY?: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  if (!visible) return null;
  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View
        entering={FadeIn.duration(160)}
        exiting={FadeOut.duration(120)}
        style={{ flex: 1, backgroundColor: 'rgba(43, 38, 32, 0.45)', justifyContent: 'flex-end' }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Fermer la liste" />
        <Animated.View
          entering={SlideInDown.springify().damping(22).stiffness(200)}
          exiting={SlideOutDown.duration(180)}
          style={{
            maxHeight: height * 0.75,
            backgroundColor: '#FBF6F0',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
          }}
        >
          <SheetHeader title={title} subtitle={subtitle} />
          <ScrollView
            ref={scrollRef}
            onLayout={() => {
              if (scrollToY) scrollRef.current?.scrollTo({ y: scrollToY, animated: false });
            }}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {children}
          </ScrollView>
          <View className="px-5 pb-8 pt-2">{footer}</View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

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
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={multiple ? 'checkbox' : 'radio'}
      accessibilityState={{ selected, checked: selected }}
      style={{ height: ROW_HEIGHT }}
      className={`mx-3 mb-1 flex-row items-center justify-between rounded-2xl px-4 ${
        selected ? 'bg-primary-soft' : 'bg-surface'
      }`}
    >
      <View className="flex-1 pr-3">
        <Text
          style={{ fontFamily: selected ? 'Nunito_800ExtraBold' : 'Nunito_700Bold' }}
          className={`text-sm ${selected ? 'text-primary' : 'text-ink'}`}
        >
          {option.label}
        </Text>
        {option.hint ? <Text className="text-xs text-ink-soft">{option.hint}</Text> : null}
      </View>
      {selected ? <Ionicons name={multiple ? 'checkbox' : 'checkmark-circle'} size={22} color="#FF6B57" /> : null}
      {!selected && multiple ? <Ionicons name="square-outline" size={22} color="#C9BFAF" /> : null}
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
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.985}
      feedback="selection"
      accessibilityRole="button"
      accessibilityLabel={`${label} : ${value ?? placeholder}`}
      className="mb-3 flex-row items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3"
    >
      <View className="flex-1 pr-3">
        <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-[11px] uppercase tracking-wide text-ink-soft">
          {label}
        </Text>
        <Text
          style={{ fontFamily: 'Nunito_800ExtraBold' }}
          className={`mt-0.5 text-base ${value ? 'text-ink' : 'text-ink-soft'}`}
        >
          {value ?? placeholder}
        </Text>
        {hint ? <Text className="text-xs text-ink-soft">{hint}</Text> : null}
      </View>
      <Ionicons name="chevron-down" size={20} color="#928A7C" />
    </PressableScale>
  );
}

/** Position à laquelle ouvrir la liste pour que l'option choisie soit visible. */
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

/** Associe à chaque option le titre de section à afficher au-dessus, s'il change. */
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
      {withHeaders(options).map(({ option, header }) => {
        return (
          <View key={String(option.value)}>
            {header ? (
              <Text
                style={{ fontFamily: 'Nunito_800ExtraBold', height: GROUP_HEIGHT }}
                className="px-5 pt-2.5 text-[11px] uppercase tracking-wide text-ink-soft"
              >
                {header}
              </Text>
            ) : null}
            <Row
              option={option}
              selected={isSelected(option.value)}
              multiple={multiple}
              onPress={() => onSelect(option.value)}
            />
          </View>
        );
      })}
    </>
  );
}

/** Champ à choix unique : ouvre une liste en bas de l'écran. */
export function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Choisir',
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
      <Field
        label={label}
        value={selected?.label}
        hint={selected?.hint}
        placeholder={placeholder}
        onPress={() => setOpen(true)}
      />
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

/** Champ à choix multiples : la liste reste ouverte jusqu'à « Terminé ». */
export function SelectMulti<T extends string>({
  label,
  values,
  options,
  onChange,
  placeholder = 'Choisir',
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
        hint={chosen.length > 1 ? `${chosen.length} sélectionnés` : undefined}
        placeholder={placeholder}
        onPress={() => setOpen(true)}
      />
      <Sheet
        visible={open}
        title={title ?? label}
        subtitle={subtitle ?? 'Plusieurs choix possibles'}
        onClose={() => setOpen(false)}
        footer={
          <PressableScale
            onPress={() => setOpen(false)}
            feedback="medium"
            className="items-center rounded-full bg-primary px-4 py-3.5 shadow-sm"
          >
            <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-white">
              Terminé
            </Text>
          </PressableScale>
        }
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
