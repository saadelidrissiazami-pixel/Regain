import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Animated, {
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Les animations d'entrée Reanimated suivent le réglage « Réduire les animations » du système ;
// les boucles (Skeleton, Wiggle) le vérifient elles-mêmes.

/** Retour haptique discret (ignoré sur le web). */
export const haptic = {
  light: () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium: () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  selection: () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
  },
  success: () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
};

const LAYOUT = LinearTransition.duration(220);

/** Apparition en glissant vers le haut, décalée selon la position dans la liste. Anime aussi
 *  les changements de taille et de position (cartes qui s'ouvrent, éléments retirés). */
export function Appear({
  index = 0,
  children,
  style,
  exiting,
}: {
  index?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  exiting?: ComponentProps<typeof Animated.View>['exiting'];
}) {
  const reduceMotion = useReducedMotion();
  return (
    <Animated.View
      exiting={exiting}
      entering={reduceMotion ? undefined : FadeInDown.delay(Math.min(index, 8) * 45).duration(240)}
      layout={reduceMotion ? undefined : LAYOUT}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

type PressableScaleProps = PressableProps & {
  className?: string;
  /** Style du conteneur animé (utile quand le bouton doit prendre `flex: 1`). */
  wrapperStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
  feedback?: keyof typeof haptic | null;
};

/** Pressable qui s'enfonce légèrement au toucher, avec un retour haptique. */
export function PressableScale({
  wrapperStyle,
  scaleTo = 0.98,
  feedback = 'light',
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <Animated.View style={[wrapperStyle, animatedStyle]}>
      <Pressable
        {...rest}
        disabled={disabled}
        onPressIn={(event) => {
          scale.set(withTiming(scaleTo, { duration: 120 }));
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          scale.set(withTiming(1, { duration: 180 }));
          onPressOut?.(event);
        }}
        onPress={(event) => {
          if (feedback) haptic[feedback]();
          onPress?.(event);
        }}
      />
    </Animated.View>
  );
}

/** Petit rebond quand `trigger` change (coche, sélection…). */
export function Pop({ trigger, children, style }: { trigger: unknown; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const scale = useSharedValue(1);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    scale.set(withSequence(withTiming(1.25, { duration: 110 }), withSpring(1, { damping: 7, stiffness: 220 })));
  }, [trigger, scale]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

/** Chevron qui pivote en douceur à l'ouverture d'une section. */
export function Chevron({ open, children }: { open: boolean; children: ReactNode }) {
  const rotation = useSharedValue(open ? 90 : 0);
  useEffect(() => {
    rotation.set(withSpring(open ? 90 : 0, { damping: 16, stiffness: 200 }));
  }, [open, rotation]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.get()}deg` }] }));
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

/** Barre de progression qui se remplit jusqu'à `progress` (0..1). */
export function ProgressBar({
  progress,
  color,
  trackColor,
  height = 8,
  delay = 0,
}: {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
  delay?: number;
}) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const clamped = Math.min(Math.max(progress, 0), 1);
  const width = useSharedValue(reduceMotion ? clamped * 100 : 0);
  useEffect(() => {
    if (reduceMotion) {
      width.set(clamped * 100);
      return;
    }
    const timer = setTimeout(() => width.set(withTiming(clamped * 100, { duration: 600 })), delay);
    return () => clearTimeout(timer);
  }, [clamped, delay, width, reduceMotion]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${width.get()}%` }));
  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{ height, borderRadius: height, backgroundColor: trackColor ?? theme.sage200, overflow: 'hidden' }}
    >
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: color ?? theme.primary600 }, fillStyle]} />
    </Animated.View>
  );
}

/** Valeur numérique qui défile jusqu'à sa cible (compteurs, anneaux de progression). */
export function useAnimatedNumber(target: number, duration = 800): number {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(reduceMotion ? target : 0);
  const current = useRef(value);

  useEffect(() => {
    const from = current.current;
    if (reduceMotion || from === target) {
      current.current = target;
      setValue(target);
      return;
    }
    const start = Date.now();
    let frame = 0;
    const tick = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      current.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduceMotion]);

  return value;
}

/** Bloc gris qui pulse pendant un chargement, à la place d'un simple indicateur. */
export function Skeleton({ height, style }: { height: number; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0.6);
  useEffect(() => {
    if (!reduceMotion) opacity.set(withRepeat(withTiming(1, { duration: 800 }), -1, true));
  }, [opacity, reduceMotion]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ height, borderRadius: 18, backgroundColor: theme.sage100, marginBottom: 12 }, style, animatedStyle]}
    />
  );
}

/** Léger balancement répété, pour attirer l'œil sur une réussite (🎉, 🔥). */
export function Wiggle({ children, active = true }: { children: ReactNode; active?: boolean }) {
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(0);
  useEffect(() => {
    if (!active || reduceMotion) {
      rotation.set(withTiming(0));
      return;
    }
    rotation.set(
      withRepeat(
        withSequence(withTiming(-8, { duration: 160 }), withTiming(8, { duration: 160 }), withTiming(0, { duration: 160 }), withTiming(0, { duration: 1400 })),
        -1
      )
    );
  }, [active, rotation, reduceMotion]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.get()}deg` }] }));
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

/** Secousse horizontale quand `trigger` change (erreur de saisie). */
export function Shake({ trigger, children }: { trigger: unknown; children: ReactNode }) {
  const offset = useSharedValue(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!trigger) return;
    offset.set(
      withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 70 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 50 })
      )
    );
  }, [trigger, offset]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
