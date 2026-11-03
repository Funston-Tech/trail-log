import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';
import { HikesProvider } from '../context/HikesContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <HikesProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Trail Log' }} />
          <Stack.Screen name="stats" options={{ title: 'Hiking stats' }} />
          <Stack.Screen name="hike/[id]" options={{ title: 'Hike details' }} />
          <Stack.Screen name="hike/form" options={{ title: 'Hike' }} />
        </Stack>
      </HikesProvider>
    </SafeAreaProvider>
  );
}
