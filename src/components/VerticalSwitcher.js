// src/components/VerticalSwitcher.js
import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VERTICALS = [
  { id: 'all',         label: 'All',         icon: '⚡' },
  { id: 'finance',     label: 'Finance',      icon: '📈' },
  { id: 'real_estate', label: 'Real Estate',  icon: '🏠' },
  { id: 'sports',      label: 'Sports',       icon: '🏆' },
  { id: 'news',        label: 'News',         icon: '📰' },
  { id: 'medical',     label: 'Medical',      icon: '⚕️' },
  { id: 'tech',        label: 'Tech',         icon: '💻' },
  { id: 'creative',    label: 'Creative',     icon: '🎨' },
  { id: 'legal',       label: 'Legal',        icon: '⚖️' },
];

export const VERTICAL_PROMPTS = {
  all:         'You are SAL — elite AI assistant for SaintSal Labs. Help with any topic.',
  finance:     'You are SAL Finance — expert in markets, stocks, crypto, DCF models, portfolio analysis, macro economics. Provide actionable financial intelligence.',
  real_estate: 'You are SAL Real Estate — expert in property investment, BRRRR, underwriting, deal analysis, market trends, foreclosures. Provide elite real estate intelligence.',
  sports:      'You are SAL Sports — expert in all sports, fantasy analysis, betting intelligence, player stats, team analysis. Provide current sports insights.',
  news:        'You are SAL News — expert in current events, geopolitics, business news. Provide balanced, comprehensive news analysis.',
  medical:     'You are SAL Health — expert in medical information, wellness, health optimization. Always note: consult a licensed physician for medical decisions.',
  tech:        'You are SAL Tech — expert in software engineering, AI/ML, startups, product strategy, developer tools. Provide elite technical intelligence.',
  creative:    'You are SAL Creative — expert in design, brand strategy, content creation, marketing, storytelling. Generate compelling creative work.',
  legal:       'You are SAL Legal — expert in business law, contracts, compliance, formation, IP. Always note: consult a licensed attorney for legal decisions.',
};

export const VERTICAL_SUGGESTIONS = {
  all:         ['What can SAL do?', 'Show me everything', 'What should I build?'],
  finance:     ['What\'s my portfolio doing?', 'Analyze NVDA stock', 'Run a DCF model for me', 'Bitcoin outlook this week'],
  real_estate: ['Find foreclosures near me', 'Run a BRRRR analysis', 'What\'s cap rate on this deal?', 'Best markets to invest in 2026'],
  sports:      ['Fantasy lineup advice', 'Analyze this trade', 'Best bets tonight', 'Latest injury report'],
  news:        ['What happened today?', 'Geopolitical summary', 'AI industry news', 'Market-moving headlines'],
  medical:     ['Health optimization tips', 'Explain this lab result', 'Best supplements for focus', 'Recovery protocols'],
  tech:        ['Review my code', 'Best AI models in 2026', 'How to build a SaaS', 'Tech stack recommendations'],
  creative:    ['Generate a brand strategy', 'Write compelling copy', 'Logo concept ideas', 'Campaign ideas'],
  legal:       ['How to form an LLC', 'Review this contract', 'IP protection strategy', 'Compliance checklist'],
};

export default function VerticalSwitcher({ onSelect, initialVertical = 'all' }) {
  const [active, setActive] = useState(initialVertical);

  useEffect(() => {
    AsyncStorage.getItem('sal_last_vertical').then(v => {
      if (v) { setActive(v); onSelect?.(v); }
    });
  }, []);

  const handleSelect = async (id) => {
    setActive(id);
    await AsyncStorage.setItem('sal_last_vertical', id);
    onSelect?.(id);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.scroll} contentContainerStyle={s.row}>
      {VERTICALS.map(v => (
        <TouchableOpacity
          key={v.id}
          style={[s.pill, active === v.id && s.pillActive]}
          onPress={() => handleSelect(v.id)}
        >
          <Text style={s.pillIcon}>{v.icon}</Text>
          <Text style={[s.pillLabel, active === v.id && s.pillLabelActive]}>{v.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const GOLD = '#D4AF37';
const s = StyleSheet.create({
  scroll: { maxHeight: 52 },
  row: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', backgroundColor: 'rgba(255,255,255,0.03)', gap: 5 },
  pillActive: { backgroundColor: GOLD, borderColor: GOLD },
  pillIcon: { fontSize: 13 },
  pillLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  pillLabelActive: { color: '#0F0F0F', fontWeight: '800' },
});
