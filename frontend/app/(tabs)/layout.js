import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { height: 64, paddingBottom: 6 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="attendance"
        options={{ title: 'Attendance', tabBarIcon: ({ color, size }) => <Ionicons name="checkbox" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: 'Insights', tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
