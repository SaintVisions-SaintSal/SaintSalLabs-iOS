/* ═══════════════════════════════════════════════════
   ONBOARDING STEP 4 — Quick Tutorial (3 swipe cards)
   Then marks onboarding complete → SAL™ tab
═══════════════════════════════════════════════════ */
import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const GOLD = '#D4AF37';
const BG = '#0A0A0A';
const { width: SCREEN_W } = Dimensions.get('window');

const CARDS = [
  {
    icon: '💬',
    title: 'Ask SAL anything',
    desc: 'Chat with elite AI across every vertical — finance, sports, tech, real estate, and more. Streaming responses, real-time data.',
  },
  {
    icon: '⚡',
    title: 'Build with AI',
    desc: 'Create websites, automations, social posts, and business tools — all powered by SAL. No code required.',
  },
  {
    icon: '🧬',
    title: 'Your DNA is live',
    desc: 'SAL now knows your business interests. Your dashboard, chat context, and recommendations are personalized to you.',
  },
];

export default function OnboardingTutorial() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setActiveIdx(idx);
  };

  const handleFinish = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            onboarding_complete: true,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
      }
    } catch (e) {
      console.warn('[Tutorial] Save error:', e);
    }

    // Go to SAL™ tab (personalized dashboard)
    router.replace('/(tabs)/sal');
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <Text style={s.step}>STEP 4 OF 4</Text>

        {/* Swipeable cards */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={s.cardScroll}
        >
          {CARDS.map((card, i) => (
            <View key={i} style={s.card}>
              <View style={s.cardIconWrap}>
                <Text style={{ fontSize: 56 }}>{card.icon}</Text>
              </View>
              <Text style={s.cardTitle}>{card.title}</Text>
              <Text style={s.cardDesc}>{card.desc}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Dots */}
        <View style={s.dotRow}>
          {CARDS.map((_, i) => (
            <View key={i} style={[s.dot, activeIdx === i && s.dotActive]} />
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={s.goldBtn} onPress={handleFinish}>
          <Text style={s.goldBtnText}>
            {activeIdx === CARDS.length - 1 ? "Let's Go →" : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { flex: 1, paddingTop: 20 },
  step: { fontSize: 11, fontWeight: '700', color: GOLD, letterSpacing: 2, marginLeft: 24, marginBottom: 16 },
  cardScroll: { flexGrow: 0 },
  card: {
    width: SCREEN_W, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center',
  },
  cardIconWrap: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(212,175,55,0.1)', borderWidth: 2, borderColor: 'rgba(212,175,55,0.3)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  cardTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 12, textAlign: 'center' },
  cardDesc: { fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 22, maxWidth: 300 },
  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)' },
  dotActive: { backgroundColor: GOLD, width: 24 },
  goldBtn: {
    backgroundColor: GOLD, borderRadius: 16, paddingVertical: 16,
    marginHorizontal: 24, alignItems: 'center', marginBottom: 40,
  },
  goldBtnText: { fontSize: 17, fontWeight: '800', color: BG },
});
