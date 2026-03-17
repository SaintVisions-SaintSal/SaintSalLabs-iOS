// Simple More tab screen
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

const GOLD = '#D4AF37';
const BG = '#0F0F0F';

const MORE_ITEMS = [
  { icon: '⚡', label: 'Upgrade Plan', sub: 'Get more compute', route: '/(stack)/pricing', gold: true },
  { icon: '🔗', label: 'Connections', sub: 'Manage integrations', route: '/(stack)/connectors-hub' },
  { icon: '🤖', label: 'AI Settings', sub: 'Models + preferences', route: '/(stack)/api-settings' },
  { icon: '🏗', label: 'My Builds', sub: 'Saved builder projects', route: '/(stack)/home-base-command' },
  { icon: '🧬', label: 'Business DNA', sub: 'Edit your profile', route: '/(stack)/business-dna-setup' },
  { icon: '⚖️', label: 'Legal Vault', sub: 'Contracts & compliance', route: '/(stack)/legal-vault' },
  { icon: '🌐', label: 'Domain & SSL', sub: 'Manage domains', route: '/(stack)/domain-ssl-command' },
  { icon: '❓', label: 'Help & Co-CEO Desk', sub: 'Get support', route: '/(stack)/help-ceo-desk' },
];

export default function MoreScreen() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(stack)/sign-in');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <View style={s.header}>
        <Text style={s.title}>More</Text>
        <Text style={s.sub}>SAINTSAL™ LABS</Text>
      </View>
      <ScrollView>
        {MORE_ITEMS.map(item => (
          <TouchableOpacity key={item.label} style={[s.item, item.gold && s.itemGold]} onPress={() => router.push(item.route)}>
            <Text style={s.itemIcon}>{item.icon}</Text>
            <View style={s.itemText}>
              <Text style={[s.itemLabel, item.gold && { color: GOLD }]}>{item.label}</Text>
              <Text style={s.itemSub}>{item.sub}</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
          <Text style={s.signOutTxt}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.12)' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  sub: { fontSize: 9, fontWeight: '700', color: 'rgba(212,175,55,0.6)', letterSpacing: 2, marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  itemGold: { backgroundColor: 'rgba(212,175,55,0.05)' },
  itemIcon: { fontSize: 22, width: 36 },
  itemText: { flex: 1 },
  itemLabel: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  itemSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  chevron: { fontSize: 22, color: 'rgba(255,255,255,0.3)' },
  signOutBtn: { margin: 20, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12 },
  signOutTxt: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
});
