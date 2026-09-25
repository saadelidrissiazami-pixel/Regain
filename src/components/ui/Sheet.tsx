import { useRef, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeProvider';
import { withAlpha } from '../../theme/colors';
import { Text } from './Text';

/** A sheet rising from the bottom: choice lists, the check-in, secondary actions. */
export function Sheet({
  visible,
  title,
  subtitle,
  onClose,
  scrollToY,
  children,
  footer,
  scroll = true,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  scrollToY?: number;
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  if (!visible) return null;
  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View
        entering={FadeIn.duration(160)}
        exiting={FadeOut.duration(120)}
        style={{ flex: 1, backgroundColor: withAlpha('#0B1815', 0.4), justifyContent: 'flex-end' }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
        <Animated.View
          accessibilityViewIsModal
          entering={reduceMotion ? FadeIn.duration(160) : SlideInDown.duration(240)}
          exiting={reduceMotion ? FadeOut.duration(120) : SlideOutDown.duration(180)}
          style={{
            maxHeight: height * 0.82,
            backgroundColor: theme.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.line, alignSelf: 'center', marginBottom: 14 }} />
            <Text variant="section" accessibilityRole="header">
              {title}
            </Text>
            {subtitle ? (
              <Text variant="caption" tone="ink2" style={{ marginTop: 2 }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {scroll ? (
            <ScrollView
              ref={scrollRef}
              onLayout={() => {
                if (scrollToY) scrollRef.current?.scrollTo({ y: scrollToY, animated: false });
              }}
              keyboardShouldPersistTaps="handled"
              // A number-pad has no return key, so a numeric field could trap the keyboard open
              // over the footer with no way to dismiss it and no way to reach the save button.
              keyboardDismissMode="on-drag"
              contentContainerStyle={{ paddingBottom: 12 }}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={{ paddingBottom: 12 }}>{children}</View>
          )}
          <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: insets.bottom + 12 }}>{footer}</View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
