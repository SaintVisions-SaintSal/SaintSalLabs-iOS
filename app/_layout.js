/* ═══════════════════════════════════════════════════
   SAINTSALLABS — ROOT LAYOUT
   Expo Router · Stack-based navigation
   Patent #10,290,222
═══════════════════════════════════════════════════ */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
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
    </>
  );
}
