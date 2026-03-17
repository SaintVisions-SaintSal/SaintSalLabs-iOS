/* ═══════════════════════════════════════════════════
   SAINTSALLABS — ROOT INDEX
   Routes through SmartEntryScreen on every launch
═══════════════════════════════════════════════════ */
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.replace('/(stack)/smart-entry?mode=returning');
      } else {
        const hasVisited = await AsyncStorage.getItem('sal_has_visited');
        if (hasVisited) {
          router.replace('/(stack)/smart-entry?mode=guest-returning');
        } else {
          router.replace('/(stack)/smart-entry?mode=first-time');
        }
      }
    })();
  }, []);

  return null;
}
