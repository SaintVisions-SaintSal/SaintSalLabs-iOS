import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Catch-all for unmatched routes (e.g., bare saintsallabs:// scheme replay on launch).
 * Redirects silently to the main tab stack so the app never hard-crashes.
 */
export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(tabs)');
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#D4AF37" size="large" />
    </View>
  );
}
