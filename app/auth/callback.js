/* ═══════════════════════════════════════════════════
   SAINTSALLABS — AUTH CALLBACK HANDLER
   Handles magic link / OAuth deep link return
   Deep link: saintsallabs://auth/callback
═══════════════════════════════════════════════════ */
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../src/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const url = Linking.useURL();
  const [status, setStatus] = useState('loading'); // 'loading' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!url) return;

    const handleCallback = async () => {
      try {
        // Parse the URL for tokens or code
        const parsed = Linking.parse(url);
        const params = parsed.queryParams || {};

        // Supabase can send: access_token + refresh_token (implicit flow)
        // or: code (PKCE flow)
        if (params.access_token && params.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          if (error) throw error;
        } else if (params.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(params.code);
          if (error) throw error;
        } else {
          // Check the URL hash fragment (Supabase sometimes puts tokens there)
          const rawUrl = url || '';
          const hashMatch = rawUrl.match(/#(.+)/);
          if (hashMatch) {
            const hashParams = new URLSearchParams(hashMatch[1]);
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            if (accessToken && refreshToken) {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (error) throw error;
            } else {
              throw new Error('No auth tokens found in callback URL.');
            }
          } else {
            throw new Error('No auth tokens found in callback URL.');
          }
        }

        // Success — go to main tabs
        router.replace('/(tabs)');
      } catch (err) {
        setErrorMsg(err?.message || 'Authentication failed. Please try again.');
        setStatus('error');
      }
    };

    handleCallback();
  }, [url]);

  if (status === 'error') {
    return (
      <View style={s.container}>
        <View style={s.iconWrap}>
          <Text style={s.iconError}>✕</Text>
        </View>
        <Text style={s.title}>Sign In Failed</Text>
        <Text style={s.message}>{errorMsg}</Text>
        <TouchableOpacity
          style={s.retryBtn}
          onPress={() => router.replace('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={s.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <ActivityIndicator size="large" color="#F59E0B" />
      <Text style={s.loadingText}>Signing you in…</Text>
      <Text style={s.loadingSub}>Verifying your credentials</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF4D4D20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconError: {
    fontSize: 28,
    color: '#FF4D4D',
    fontWeight: '800',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F5F5F5',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  retryBtn: {
    height: 52,
    paddingHorizontal: 40,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F0F0F',
    letterSpacing: 0.5,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F5F5',
    marginTop: 24,
    textAlign: 'center',
  },
  loadingSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
