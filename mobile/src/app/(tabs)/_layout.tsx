import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { T, useC } from '@/components/ui';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: { name: string; label: string; on: IconName; off: IconName }[] = [
  { name: 'home', label: 'Home', on: 'home', off: 'home-outline' },
  { name: 'activity', label: 'Activity', on: 'swap-vertical', off: 'swap-vertical-outline' },
  { name: 'insights', label: 'Insights', on: 'stats-chart', off: 'stats-chart-outline' },
  { name: 'lists', label: 'Lists', on: 'checkbox', off: 'checkbox-outline' },
  { name: 'settings', label: 'Settings', on: 'settings', off: 'settings-outline' },
];

// The last four are reached from other screens; they keep the tab bar but have no tab of their own.
const SCREENS = ['home', 'activity', 'insights', 'lists', 'settings', 'budgets', 'recurring', 'categories', 'tags'];

function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const c = useC();
  const insets = useSafeAreaInsets();
  const current = state.routes[state.index]?.name;
  return (
    <View
      style={{
        flexDirection: 'row', backgroundColor: c.tabBar, borderTopWidth: 1, borderTopColor: c.border,
        paddingTop: 10, paddingHorizontal: 12, paddingBottom: insets.bottom + 10,
      }}>
      {TABS.map((t) => {
        const on = current === t.name;
        const route = state.routes.find((r) => r.name === t.name);
        return (
          <Pressable
            key={t.name}
            onPress={() => route && navigateToTab(route.key)}
            style={{ flex: 1, alignItems: 'center', gap: 5, paddingTop: 4 }}>
            <Ionicons name={on ? t.on : t.off} size={21} color={on ? c.tabOn : c.tabOff} />
            <T w={700} s={10} c={on ? c.tabOn : c.tabOff}>{t.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const c = useC();
  return (
    <Tabs
      backBehavior="history"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}>
      {SCREENS.map((name) => (
        <Tabs.Screen key={name} name={name} />
      ))}
    </Tabs>
  );
}
