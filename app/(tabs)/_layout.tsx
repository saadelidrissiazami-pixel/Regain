import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { haptic, Pop } from '../../src/components/motion';

const ACTIVE = '#FF6B57';
const INACTIVE = '#C9BFAF';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Icône d'onglet qui rebondit quand l'onglet devient actif. */
function TabIcon({ icon, focused, color, size }: { icon: string; focused: boolean; color: ColorValue; size: number }) {
  return (
    <Pop trigger={focused ? 'on' : 'off'}>
      <Ionicons name={(focused ? icon : `${icon}-outline`) as IconName} size={size} color={color} />
    </Pop>
  );
}

const TABS = [
  { name: 'planning', title: 'Planning', icon: 'calendar' },
  { name: 'wellbeing', title: 'Bien-être', icon: 'leaf' },
  { name: 'fitness', title: 'Forme', icon: 'barbell' },
  { name: 'tracking', title: 'Suivi', icon: 'bar-chart' },
  { name: 'profile', title: 'Profil', icon: 'person' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenListeners={{ tabPress: () => haptic.selection() }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: { fontFamily: 'Nunito_700Bold', fontSize: 11 },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EEE4D6',
          height: 84,
          paddingTop: 8,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused, size }) => <TabIcon icon={tab.icon} focused={focused} color={color} size={size} />,
          }}
        />
      ))}
    </Tabs>
  );
}
