/* ═══════════════════════════════════════════════════
   SAINTSALLABS — ROOT INDEX
   Redirects to splash screen on app open
═══════════════════════════════════════════════════ */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(auth)/splash" />;
}
