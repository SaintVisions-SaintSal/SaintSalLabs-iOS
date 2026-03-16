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
      <Stack.Screen name="elite-deploy" />

      {/* Navigation */}
      <Stack.Screen name="navigation-hub" />

      {/* SAL Chat Modes (Phase 3) */}
      <Stack.Screen name="sal-chat" />

      {/* Intelligence (Phase 4) */}
      <Stack.Screen name="elite-intelligence" />
      <Stack.Screen name="full-spectrum-intel" />
      <Stack.Screen name="image-hub" />
      <Stack.Screen name="geo-master" />

      {/* Builder (Phase 5) */}
      <Stack.Screen name="builder-planning" />
      <Stack.Screen name="builder-viewport" />
      <Stack.Screen name="build-connections" />

      {/* Social (Phase 6) */}
      <Stack.Screen name="social-content-gen" />

      {/* Real Estate (Phase 7) */}
      <Stack.Screen name="elite-real-estate" />
      <Stack.Screen name="re-manifest" />

      {/* GHL (Phase 8) */}
      <Stack.Screen name="ghl-smart-bridge" />

      {/* Platform (Phase 9) */}
      <Stack.Screen name="elite-connectors" />
      <Stack.Screen name="hook-workflow" />
      <Stack.Screen name="business-formation" />
      <Stack.Screen name="legal-vault" />
      <Stack.Screen name="help-ceo-desk" />
    </Stack>
  );
}
