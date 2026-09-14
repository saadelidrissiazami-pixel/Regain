import { Text, View } from 'react-native';

type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ eyebrow, title, subtitle }: ScreenHeaderProps) {
  return (
    <View className="mb-7">
      <Text
        className="font-display mb-1.5 text-xs uppercase tracking-widest text-primary"
      >
        {eyebrow}
      </Text>
      <Text className="font-display text-[28px] leading-8 text-ink">
        {title}
      </Text>
      {subtitle ? <Text className="font-body mt-1.5 text-sm text-ink-soft">{subtitle}</Text> : null}
    </View>
  );
}
