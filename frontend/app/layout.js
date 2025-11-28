import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const headerBg = colorScheme === 'dark' ? '#030712' : '#0f172a';

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: headerBg },
          headerTintColor: '#f8fafc',
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="batches" options={{ title: 'Manage Batches' }} />
        <Stack.Screen name="students" options={{ title: 'Manage Students' }} />
        <Stack.Screen name="defaulters" options={{ title: 'Defaulter List' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
