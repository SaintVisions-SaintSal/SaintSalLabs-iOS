/* ═══════════════════════════════════════════════════
   SAINTSALLABS — ROOT LAYOUT
   Expo Router · Supabase Auth · Stack navigation
   Patent #10,290,222
═══════════════════════════════════════════════════ */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/lib/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#0C0C0F" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0C0C0F' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(stack)" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </AuthProvider>
  );
}
