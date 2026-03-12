/* ═══════════════════════════════════════════════════
   SAINTSALLABS — STACK NAVIGATION
   All deep-link screens accessible from tabs
═══════════════════════════════════════════════════ */
import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0C0C0F' },
        animation: 'slide_from_right',
      }}
    >
      {/* Builder */}
      <Stack.Screen name="mobile-ide" />
      <Stack.Screen name="builder-deploy" />

      {/* Social */}
      <Stack.Screen name="social-generator" />
      <Stack.Screen name="social-studio" />
      <Stack.Screen name="social-connections" />

      {/* Portfolio */}
      <Stack.Screen name="portfolio" />
      <Stack.Screen name="investor-analysis" />
      <Stack.Screen name="real-estate" />

      {/* Payments */}
      <Stack.Screen name="pricing" />
      <Stack.Screen name="credit-topup" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="stripe-pricing" />

      {/* Settings */}
      <Stack.Screen name="api-settings" />

      {/* Deploy */}
      <Stack.Screen name="github-console" />
      <Stack.Screen name="domain-hub" />
    </Stack>
  );
}
