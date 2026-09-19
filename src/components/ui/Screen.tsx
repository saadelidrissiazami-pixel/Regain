import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';

/**
 * Conteneur d'écran : fond, zone sûre, marges latérales, défilement. `footer` reste collé en
 * bas (bouton principal d'un écran de saisie ou d'un lecteur), au-dessus de l'indicateur d'accueil.
 */
export function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  footer,
  inTabs = false,
  keyboard = false,
  padded = true,
  contentStyle,
  background,
}: {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: ReactNode;
  /** Écran d'onglet : la barre d'onglets gère déjà la zone basse. */
  inTabs?: boolean;
  /** Formulaires : le contenu remonte au-dessus du clavier. */
  keyboard?: boolean;
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  background?: string;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = inTabs ? 0 : insets.bottom;
  const padding: ViewStyle = {
    paddingTop: insets.top + spacing.xs,
    paddingHorizontal: padded ? spacing.screen : 0,
    paddingBottom: footer ? spacing.lg : spacing.xxl + bottomInset,
  };

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[padding, contentStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={theme.primary600} colors={[theme.primary600]} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, padding, contentStyle]}>{children}</View>
  );

  const content = (
    <>
      {body}
      {footer ? (
        <View
          style={{
            paddingHorizontal: spacing.screen,
            paddingTop: spacing.sm,
            paddingBottom: bottomInset + spacing.sm,
            backgroundColor: background ?? theme.bg,
            borderTopWidth: 1,
            borderTopColor: theme.divider,
          }}
        >
          {footer}
        </View>
      ) : null}
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: background ?? theme.bg }}>
      {keyboard ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
  );
}
