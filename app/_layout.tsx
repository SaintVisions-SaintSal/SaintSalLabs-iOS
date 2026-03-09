/**
 * SaintSal Labs — Root Layout
 * Dark theme, Supabase auth listener
 */
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '../src/lib/supabase';
import { useStore } from '../src/lib/store';
import { Colors } from '../src/config/theme';

export default function RootLayout() {
  const { setUser, setAuthToken } = useStore();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
          tier: 'free', // Will be fetched from profiles table
          credits_remaining: 100,
          credits_total: 100,
        });
        setAuthToken(session.access_token);

        // Fetch profile for tier info
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan_tier, credits_remaining')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
            tier: (profile.plan_tier as any) || 'free',
            credits_remaining: profile.credits_remaining || 100,
            credits_total: 100,
          });
        }
      } else {
        setUser(null);
        setAuthToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.bg },
            animation: 'slide_from_right',
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
