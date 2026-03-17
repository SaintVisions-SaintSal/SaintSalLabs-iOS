/* ═══════════════════════════════════════════════════
   APP CLIP SCREEN — SaintSal™ Labs
   Apple App Clip entry point (15MB max, < 10s load)
   Mirrors: saintsallabs.com/app-clip
   Apple HIG: one clear CTA, trust signals, privacy
═══════════════════════════════════════════════════ */
import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Animated, Linking, Image,
} from 'react-native';
import { useRouter } from 'expo-router';

const GOLD  = '#D4AF37';
const BG    = '#080808';
const CARD  = 'rgba(255,255,255,0.04)';

const PATHS = [
  { icon: '🔍', name: 'Intelligence', desc: 'Search 5 AI engines', route: '/(tabs)/search' },
  { icon: '💬', name: 'Chat',         desc: 'Multi-model AI chat', route: '/(tabs)/chat'   },
  { icon: '⚡', name: 'Builder',      desc: 'Build with AI',       route: '/(tabs)/build'  },
];

const PLATFORMS = [
  { name: 'SaintSal™ AI',   url: 'saintsal.ai',     desc: 'Personal AI · 9 verticals'   },
  { name: 'SaintSal™ Labs', url: 'saintsallabs.com', desc: 'Builder · GHL · Intelligence' },
];

export default function AppClipScreen() {
  const router  = useRouter();
  const floatY  = useRef(new Animated.Value(0)).current;
  const liveDot = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Float animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -10, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0,   duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Live dot pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(liveDot, { toValue: 0.3, duration: 750, useNativeDriver: true }),
        Animated.timing(liveDot, { toValue: 1,   duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, [floatY, liveDot]);

  const openFullApp = () => {
    Linking.openURL('https://apps.apple.com/app/saintsallabs').catch(() =>
      router.replace('/(tabs)/search')
    );
  };

  const handlePath = (route) => {
    router.replace(route);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Grid BG */}
      <View style={s.gridBg} />

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* APPLE HIG: App badge header */}
        <View style={s.appBadge}>
          <Image
            source={require('../../../assets/icon.png')}
            style={s.appIcon}
            resizeMode="contain"
          />
          <View style={s.appInfo}>
            <Text style={s.appName}>SaintSal™ Labs</Text>
            <Text style={s.appSub}>Responsible Intelligence™</Text>
          </View>
          <TouchableOpacity style={s.openBtn} onPress={openFullApp}>
            <Text style={s.openBtnTxt}>Open</Text>
          </TouchableOpacity>
        </View>

        {/* HERO */}
        <View style={s.hero}>
          {/* Live badge */}
          <View style={s.liveBadge}>
            <Animated.View style={[s.liveDot, { opacity: liveDot }]} />
            <Text style={s.liveTxt}>All 8 AI Providers Live · Patent #10,290,222</Text>
          </View>

          {/* Floating logo — transparent helmet, no dark box */}
          <Animated.Image
            source={require('../../../assets/icon.png')}
            style={[s.logo, { transform: [{ translateY: floatY }] }]}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={s.titleW}>THE AI THAT</Text>
          <Text style={s.titleG}>ACTUALLY SHOWS UP</Text>

          <Text style={s.sub}>
            <Text style={s.subBold}>Your Gotta Guy™.</Text>
            {' Claude + GPT + Gemini + Grok.\nPowered by Patented HACP™ Technology.'}
          </Text>
        </View>

        {/* PRIMARY CTA — Apple HIG: one clear action */}
        <View style={s.actions}>
          <TouchableOpacity style={s.primaryBtn} onPress={() => router.replace('/(auth)/sign-up')}>
            <Text style={s.primaryBtnTxt}>⚡ START FREE — NO CARD NEEDED</Text>
          </TouchableOpacity>

          {/* 3 Quick Paths */}
          <View style={s.pathGrid}>
            {PATHS.map(p => (
              <TouchableOpacity key={p.name} style={s.pathCard} onPress={() => handlePath(p.route)}>
                <Text style={s.pathIcon}>{p.icon}</Text>
                <Text style={s.pathName}>{p.name}</Text>
                <Text style={s.pathDesc}>{p.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* TRUST SIGNALS */}
        <View style={s.trustCard}>
          {[
            { icon: '🔒', txt: 'Encrypted & private · HIPAA ready' },
            { icon: '⚡', txt: 'US Patent #10,290,222 · Apple & Google recognized' },
            { icon: '🏛️', txt: 'Saint Vision Technologies LLC · HB, CA' },
          ].map((t, i) => (
            <View key={i} style={[s.trustRow, i < 2 && { marginBottom: 6 }]}>
              <Text style={s.trustIcon}>{t.icon}</Text>
              <Text style={s.trustTxt}>{t.txt}</Text>
            </View>
          ))}
        </View>

        {/* HB LOCALS OFFER */}
        <View style={s.offerCard}>
          <View>
            <Text style={s.offerTag}>HB Locals Special 🏄</Text>
            <Text style={s.offerHl}>20% OFF <Text style={{ color: GOLD }}>FIRST MONTH</Text></Text>
          </View>
          <View style={s.offerCode}>
            <Text style={s.offerCodeTxt}>HBLOCAL</Text>
            <Text style={s.offerCodeSub}>AT CHECKOUT</Text>
          </View>
        </View>

        {/* PLATFORMS */}
        <View style={s.platforms}>
          {PLATFORMS.map(p => (
            <View key={p.name} style={s.platCard}>
              <Text style={s.platName}>{p.name}</Text>
              <Text style={s.platUrl}>{p.url}</Text>
              <Text style={s.platDesc}>{p.desc}</Text>
            </View>
          ))}
        </View>

        {/* FOOTER — Apple required: privacy + terms */}
        <View style={s.footer}>
          <View style={s.footerLinks}>
            <TouchableOpacity onPress={() => Linking.openURL('https://saintsallabs.com/privacy')}>
              <Text style={s.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://saintsallabs.com/terms')}>
              <Text style={s.footerLink}>Terms of Use</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openFullApp}>
              <Text style={s.footerLink}>Full App</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.footerTxt}>
            © 2026 Saint Vision Technologies LLC{'\n'}
            US Patent #10,290,222 · Responsible Intelligence™
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: BG },
  gridBg:       { position: 'absolute', inset: 0, opacity: 0.04 },
  scroll:       { flex: 1 },

  // App badge
  appBadge:     { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '10px 16px' as any, paddingHorizontal: 16, paddingVertical: 10 },
  appIcon:      { width: 44, height: 44, borderRadius: 0 }, // no border-radius — clean transparent logo
  appInfo:      { flex: 1 },
  appName:      { fontSize: 15, fontWeight: '700', color: 'white' },
  appSub:       { fontSize: 11, color: 'rgba(255,255,255,0.45)' },
  openBtn:      { backgroundColor: GOLD, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  openBtnTxt:   { fontSize: 13, fontWeight: '800', color: BG },

  // Hero
  hero:         { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 0 },
  liveBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,255,136,0.08)', borderWidth: 1, borderColor: 'rgba(0,255,136,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, marginBottom: 16 },
  liveDot:      { width: 5, height: 5, backgroundColor: '#00FF88', borderRadius: 3 },
  liveTxt:      { fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: '#00FF88' },
  logo:         { width: 140, height: 140 }, // transparent RGBA PNG — no dark box
  titleW:       { fontSize: 52, fontWeight: '900', color: 'white', letterSpacing: 2, marginTop: 12, fontFamily: 'Bebas Neue' },
  titleG:       { fontSize: 52, fontWeight: '900', color: GOLD, letterSpacing: 2, textShadowColor: 'rgba(212,175,55,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16 },
  sub:          { fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 20, textAlign: 'center', marginTop: 10, paddingHorizontal: 8 },
  subBold:      { color: 'white', fontWeight: '700' },

  // Actions
  actions:      { paddingHorizontal: 24, paddingTop: 20, gap: 10 },
  primaryBtn:   { backgroundColor: GOLD, padding: 18, borderRadius: 14, alignItems: 'center', shadowColor: GOLD, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20 },
  primaryBtnTxt:{ fontSize: 20, fontWeight: '900', color: BG, letterSpacing: 2 },
  pathGrid:     { flexDirection: 'row', gap: 8 },
  pathCard:     { flex: 1, backgroundColor: CARD, borderWidth: 1, borderColor: 'rgba(212,175,55,0.12)', borderRadius: 12, padding: 14, alignItems: 'center' },
  pathIcon:     { fontSize: 24, marginBottom: 6 },
  pathName:     { fontSize: 13, fontWeight: '800', color: GOLD, letterSpacing: 1, marginBottom: 2 },
  pathDesc:     { fontSize: 9, color: 'rgba(255,255,255,0.38)', textAlign: 'center', lineHeight: 13 },

  // Trust
  trustCard:    { margin: 16, marginTop: 16, backgroundColor: 'rgba(255,255,255,0.025)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)', borderRadius: 12, padding: 12 },
  trustRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trustIcon:    { fontSize: 14 },
  trustTxt:     { fontSize: 11, color: 'rgba(255,255,255,0.45)', flex: 1 },

  // Offer
  offerCard:    { marginHorizontal: 16, backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  offerTag:     { fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: GOLD, opacity: 0.7 },
  offerHl:      { fontSize: 18, fontWeight: '900', color: 'white', marginTop: 2 },
  offerCode:    { backgroundColor: GOLD, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  offerCodeTxt: { fontSize: 16, fontWeight: '900', color: BG, letterSpacing: 3 },
  offerCodeSub: { fontSize: 7, fontWeight: '700', color: BG, opacity: 0.6, letterSpacing: 1 },

  // Platforms
  platforms:    { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 12 },
  platCard:     { flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)', borderRadius: 10, padding: 10 },
  platName:     { fontSize: 12, fontWeight: '800', color: GOLD, letterSpacing: 1 },
  platUrl:      { fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginVertical: 2 },
  platDesc:     { fontSize: 9, color: 'rgba(255,255,255,0.4)', lineHeight: 13 },

  // Footer
  footer:       { padding: 16, paddingTop: 16, alignItems: 'center' },
  footerLinks:  { flexDirection: 'row', gap: 16, marginBottom: 8 },
  footerLink:   { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  footerTxt:    { fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 16, letterSpacing: 0.5 },
});
