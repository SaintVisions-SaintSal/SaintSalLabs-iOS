/* ═══════════════════════════════════════════════════
   SCREEN 1 — SPLASH / LOADER
   testflight_splash_assets → Animated app loader
   Colors: #0F0F0F bg · #D4AF37 gold · #F59E0B amber
═══════════════════════════════════════════════════ */
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SplashScreen() {
  const router = useRouter();

  // Animations
  const logoScale  = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const dotAnim    = useRef(new Animated.Value(0)).current;
  const barWidth   = useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 1, duration: 800, delay: 200, useNativeDriver: true }),
      Animated.timing(tagOpacity, { toValue: 1, duration: 600, delay: 500, useNativeDriver: true }),
    ]).start();

    // Progress bar fill
    Animated.timing(barWidth, {
      toValue: 1,
      duration: 2200,
      delay: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();

    // Dots loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 2, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 3, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ])
    ).start();

    // Check auth state after 2.8s, then route
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/(tabs)/');
      } else {
        router.replace('/(auth)/login');
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const barInterpolated = barWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={s.container}>
      {/* Ambient glow top-right */}
      <Animated.View style={[s.glowTopRight, { opacity: glowOpacity }]} />
      {/* Ambient glow bottom-left */}
      <Animated.View style={[s.glowBottomLeft, { opacity: glowOpacity }]} />

      {/* Center content */}
      <View style={s.center}>
        {/* Logo + icon */}
        <Animated.View style={[s.logoWrap, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
          <View style={s.logoIconBg}>
            <Text style={s.logoIconText}>S</Text>
          </View>
        </Animated.View>

        {/* Brand name */}
        <Animated.View style={{ opacity: logoOpacity }}>
          <Text style={s.brandName}>SAINTSAL™ LABS</Text>
          <Text style={s.brandTagline}>Elite Intelligence Platform</Text>
        </Animated.View>

        {/* Loading bar */}
        <View style={s.barTrack}>
          <Animated.View style={[s.barFill, { width: barInterpolated }]} />
        </View>

        {/* Status text */}
        <Animated.View style={{ opacity: tagOpacity, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={s.statusDot} />
          <Text style={s.statusText}>INITIALIZING SYSTEMS</Text>
        </Animated.View>
      </View>

      {/* Bottom patent / version */}
      <View style={s.footer}>
        <Text style={s.footerText}>US Patent #10,290,222 · HACP Protocol™</Text>
        <Text style={s.versionText}>v2.0.2 · Saint Vision Technologies</Text>
      </View>
    </View>
  );
}

const GOLD = '#D4AF37';
const AMBER = '#F59E0B';
const BG = '#0F0F0F';

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: AMBER,
    opacity: 0.08,
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: 40,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: GOLD,
    opacity: 0.06,
  },
  center: {
    alignItems: 'center',
    gap: 20,
  },
  logoWrap: {
    marginBottom: 8,
  },
  logoIconBg: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    borderWidth: 1.5,
    borderColor: GOLD + '55',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  logoIconText: {
    fontSize: 44,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: -2,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#E8E6E1',
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 4,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '500',
    color: GOLD + '80',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  barTrack: {
    width: 200,
    height: 3,
    backgroundColor: '#1C1C24',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  barFill: {
    height: 3,
    backgroundColor: GOLD,
    borderRadius: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#444455',
    letterSpacing: 1,
    textAlign: 'center',
  },
  versionText: {
    fontSize: 9,
    color: '#333344',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
