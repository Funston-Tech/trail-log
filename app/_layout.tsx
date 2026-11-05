import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';
import { HikesProvider } from '../context/HikesContext';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  if (!publishableKey) {
    throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file before starting Trail Log.');
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

function RootNavigator() {
  const { isSignedIn, userId } = useAuth();
  const signedIn = isSignedIn === true;

  const stack = (
    <>
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
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="index" options={{ title: 'Trail Log' }} />
          <Stack.Screen name="stats" options={{ title: 'Hiking stats' }} />
          <Stack.Screen name="hike/[id]" options={{ title: 'Hike details' }} />
          <Stack.Screen name="hike/form" options={{ title: 'Hike' }} />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );

  if (signedIn && userId) {
    return <HikesProvider key={userId} userId={userId}>{stack}</HikesProvider>;
  }

  return stack;
}
