/* ═══════════════════════════════════════════════════
   SAINTSALLABS — ROOT LAYOUT
   Expo Router · Supabase Auth · Stack navigation
   Patent #10,290,222
═══════════════════════════════════════════════════ */
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/lib/AuthContext';
import { logAppOpen } from '../src/lib/analytics';
import ErrorBoundary from '../src/components/ErrorBoundary';

export default function RootLayout() {
  useEffect(() => { logAppOpen(); }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#0F0F0F" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0F0F0F' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'none' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(stack)" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </AuthProvider>
    </ErrorBoundary>
  );
}
