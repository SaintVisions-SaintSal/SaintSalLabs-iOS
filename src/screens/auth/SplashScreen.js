/* ═══════════════════════════════════════════════════
   SAINTSAL LABS — SPLASH SCREEN
   Animated logo + gold ring, auto-navigate
═══════════════════════════════════════════════════ */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const GOLD = '#D4AF37';
const BLACK = '#0F0F0F';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GOLD_DIM = 'rgba(212,175,55,0.1)';
const MUTED = 'rgba(255,255,255,0.5)';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(ringScale, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(ringRotate, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    const timer = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace('/(tabs)');
        } else {
          router.replace('/sign-in');
        }
      } catch {
        router.replace('/sign-in');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const ringInterpolate = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />

      <Animated.View
        style={[
          styles.outerRing,
          {
            opacity: ringOpacity,
            transform: [{ scale: Animated.multiply(ringScale, pulseAnim) }, { rotate: ringInterpolate }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.innerRing,
          { opacity: ringOpacity, transform: [{ scale: ringScale }] },
        ]}
      />

      <Animated.View
        style={[
          styles.logoCircle,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Text style={styles.logoLetter}>S</Text>
      </Animated.View>

      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Text style={styles.brandName}>SAINTSAL™</Text>
        <Text style={styles.brandSub}>LABS</Text>
      </Animated.View>

      <Animated.View style={[styles.taglineContainer, { opacity: taglineOpacity }]}>
        <Text style={styles.tagline}>THE ELITE LABORATORY</Text>
        <View style={styles.taglineLine} />
      </Animated.View>

      <Animated.View style={[styles.statusRow, { opacity: taglineOpacity }]}>
        <View style={[styles.statusDot, styles.dotActive]} />
        <Text style={styles.statusText}>INITIALIZING SYSTEMS</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: GOLD,
    borderStyle: 'dashed',
  },
  innerRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: GOLD,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: GOLD_DIM,
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  logoLetter: {
    fontSize: 52,
    fontWeight: '800',
    color: GOLD,
    fontFamily: 'PublicSans-Bold',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 8,
    fontFamily: 'PublicSans-ExtraBold',
  },
  brandSub: {
    fontSize: 14,
    fontWeight: '700',
    color: GOLD,
    letterSpacing: 10,
    marginTop: 4,
    fontFamily: 'PublicSans-Bold',
  },
  taglineContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  tagline: {
    fontSize: 9,
    color: MUTED,
    letterSpacing: 5,
    fontFamily: 'PublicSans-Regular',
  },
  taglineLine: {
    width: 40,
    height: 1,
    backgroundColor: GOLD,
    marginTop: 12,
    opacity: 0.5,
  },
  statusRow: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: '#4ade80',
  },
  statusText: {
    fontSize: 9,
    color: MUTED,
    letterSpacing: 3,
    fontFamily: 'PublicSans-Regular',
  },
});
