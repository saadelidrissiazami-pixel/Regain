import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptic } from '../../src/components/ui/motion';
import { t } from '../../src/lib/i18n';
import { useTheme } from '../../src/theme/ThemeProvider';
import { font } from '../../src/theme/typography';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: string }[] = [
  { name: 'planning', title: t('Plan'), icon: 'calendar' },
  { name: 'wellbeing', title: t('Wellbeing'), icon: 'leaf' },
  { name: 'fitness', title: t('Fitness'), icon: 'barbell' },
  { name: 'tracking', title: t('Tracking'), icon: 'bar-chart' },
  { name: 'profile', title: t('Profile'), icon: 'person' },
];

function TabIcon({ icon, focused, color }: { icon: string; focused: boolean; color: ColorValue }) {
  return <Ionicons name={(focused ? icon : `${icon}-outline`) as IconName} size={24} color={color} />;
}

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenListeners={{ tabPress: () => haptic.selection() }}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        tabBarActiveTintColor: theme.primary600,
        tabBarInactiveTintColor: theme.dark ? theme.ink3 : '#607872',
        tabBarLabelStyle: { ...font(600), fontSize: 11, marginTop: 2 },
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.divider,
          borderTopWidth: 1,
          height: 58 + Math.max(insets.bottom, 8),
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
          elevation: 0,
          shadowOpacity: 0,
        },
        sceneStyle: { backgroundColor: theme.bg },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.title,
            tabBarIcon: ({ color, focused }) => <TabIcon icon={tab.icon} focused={focused} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
