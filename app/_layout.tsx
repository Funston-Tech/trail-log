import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { HikesProvider } from '../context/HikesContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootNavigation() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const isAuthScreen = segments[0] === 'sign-in' || segments[0] === 'sign-up';

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!token && !isAuthScreen) {
    return <Redirect href="/sign-in" />;
  }

  if (token && isAuthScreen) {
    return <Redirect href="/" />;
  }

  return (
    <HikesProvider>
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
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="hike/[id]" options={{ title: 'Hike details' }} />
        <Stack.Screen name="hike/form" options={{ title: 'Hike' }} />
      </Stack>
    </HikesProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
