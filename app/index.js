/* ═══════════════════════════════════════════════════
   SAINTSALLABS — ROOT INDEX (Build #68)
   NO AUTH WALL. Everyone lands on Search tab.
   Auth check runs silently to set user state.
═══════════════════════════════════════════════════ */
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Always go to tabs — Search is the homepage, no auth gate
    router.replace('/(tabs)');
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#D4AF37" size="large" />
    </View>
  );
}
