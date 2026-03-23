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
        contentStyle: { backgroundColor: '#0F0F0F' },
        animation: 'slide_from_right',
      }}
    >
      {/* Builder */}
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

      {/* SAL Chat Modes (Phase 3) */}
      <Stack.Screen name="sal-chat" />

      {/* Intelligence (Phase 4) */}
      <Stack.Screen name="elite-intelligence" />
      <Stack.Screen name="full-spectrum-intel" />
      <Stack.Screen name="image-hub" />
      <Stack.Screen name="geo-master" />

      {/* Builder (Phase 5) */}
      <Stack.Screen name="builder-planning" />

      {/* Social (Phase 6) */}
      <Stack.Screen name="social-content-gen" />

      {/* Real Estate (Phase 7) */}
      <Stack.Screen name="elite-real-estate" />
      <Stack.Screen name="re-manifest" />

      {/* GHL (Phase 8) */}

      {/* Platform (Phase 9) */}
      <Stack.Screen name="elite-connectors" />
      <Stack.Screen name="hook-workflow" />
      <Stack.Screen name="business-formation" />
      <Stack.Screen name="legal-vault" />
      <Stack.Screen name="help-ceo-desk" />

      {/* Stitch Screens (Phase 10) — 16 new wired screens */}
      <Stack.Screen name="elite-intel-hub" />
      <Stack.Screen name="elite-re-finder" />
      <Stack.Screen name="global-intel-chat" />
      <Stack.Screen name="finance-chat" />
      <Stack.Screen name="creative-chat" />
      <Stack.Screen name="re-executive-chat" />
      <Stack.Screen name="ghl-smart-bridge-v2" />
      <Stack.Screen name="home-base-command" />
      <Stack.Screen name="social-studio-v2" />
      <Stack.Screen name="content-generator" />
      <Stack.Screen name="full-spectrum-v2" />
      <Stack.Screen name="image-hub-v2" />
      <Stack.Screen name="connectors-hub" />
      <Stack.Screen name="ai-planning-agent" />
      <Stack.Screen name="high-fidelity-ide" />

      {/* Stitch Screens (Phase 11) — additional screens */}
      <Stack.Screen name="domain-ssl-command" />
      <Stack.Screen name="github-console-v2" />

      {/* Smart Entry — universal launch screen */}
      <Stack.Screen name="smart-entry" options={{ animation: 'fade' }} />

      {/* Auth Flow (Phase 12) */}
      <Stack.Screen name="splash" options={{ animation: 'fade' }} />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="email-verify" />
      <Stack.Screen name="business-dna-setup" />
      <Stack.Screen name="elite-auth" />

      {/* New Stitch Screens (Phase 12) */}
      <Stack.Screen name="geo-master-hub" />
      <Stack.Screen name="ghl-bridge-v2" />
      <Stack.Screen name="real-estate-suite" />
      <Stack.Screen name="domain-ssl" />
      <Stack.Screen name="business-formation-v2" />
      <Stack.Screen name="legal-vault-v2" />
      <Stack.Screen name="github-console-v3" />
      <Stack.Screen name="hook-workflow-v2" />
      <Stack.Screen name="co-ceo-desk" />

      {/* NOTE: credit-topup, social-generator, social-connections already declared above */}

      {/* Build #68 — Onboarding Flow */}
      <Stack.Screen name="onboarding-welcome" />
      <Stack.Screen name="onboarding-dna" />
      <Stack.Screen name="onboarding-profile" />
      <Stack.Screen name="onboarding-tutorial" />

      {/* Build #68 — GHL Command Center */}
      <Stack.Screen name="ghl-command" />

      {/* Build #89 — SAL HQ + Career Suite + GHL Hub */}
      <Stack.Screen name="builder-preview" />
      <Stack.Screen name="file-explorer" />
      <Stack.Screen name="builder-settings" />
      {/* kinetic-dashboard redirects to SAL HQ (Build #89) */}

      {/* Build #85 — Voice AI (ElevenLabs Conversational Agent) */}
      <Stack.Screen name="voice-ai" />

      {/* Build #89 — Restructure: Career Suite + GHL Intel Hub */}
      <Stack.Screen name="career-suite" />
      <Stack.Screen name="ghl-intel-hub" />
    </Stack>
  );
}
