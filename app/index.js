/* ═══════════════════════════════════════════════════
   SAINTSALLABS — ROOT INDEX
   Auth check → route to tabs (authenticated) or sign-in (not)
   Tabs are the home base. Stack screens push on top.
═══════════════════════════════════════════════════ */
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Authenticated → go to main app (tabs)
          router.replace('/(tabs)');
        } else {
          // Not authenticated → go to sign-in
          router.replace('/(auth)/elite-auth');
        }
      } catch (e) {
        console.warn('[Index] Auth check error:', e);
        router.replace('/(auth)/elite-auth');
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  // Loading spinner while checking auth
  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F0F', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#D4AF37" size="large" />
    </View>
  );
}
