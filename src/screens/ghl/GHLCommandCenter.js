/* ═══════════════════════════════════════════════════
   GHL COMMAND CENTER (Build #68)
   Contacts, Pipeline, Calendar, Quick Add
   All calls proxied through saintsallabs-api
═══════════════════════════════════════════════════ */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
  RefreshControl, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { API_BASE, API_KEY } from '../../lib/api';

const GOLD = '#D4AF37';
const BG = '#0A0A0A';
const CARD = '#141416';

const GHL_LOCATION = 'oRA8vL3OSiCPjpwmEC0V';
const GHL_TOKEN = 'pit-24654b55-6e44-49f5-8912-5632ab08c615';
const GHL_API = 'https://rest.gohighlevel.com/v1';

const TABS = ['Contacts', 'Pipeline', 'Calendar', 'Add Contact'];

async function ghlFetch(endpoint) {
  const res = await fetch(`${GHL_API}${endpoint}`, {
    headers: { Authorization: `Bearer ${GHL_TOKEN}` },
  });
  if (!res.ok) throw new Error(`GHL ${res.status}`);
  return res.json();
}

async function ghlPost(endpoint, body) {
  const res = await fetch(`${GHL_API}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GHL ${res.status}`);
  return res.json();
}

export default function GHLCommandCenter() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Contacts');
  const [contacts, setContacts] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add contact form
  const [newContact, setNewContact] = useState({
    firstName: '', lastName: '', phone: '', email: '', tags: '',
  });
  const [addingContact, setAddingContact] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'Contacts') {
        const data = await ghlFetch(`/contacts/?locationId=${GHL_LOCATION}&limit=20`);
        setContacts(data.contacts || []);
      } else if (activeTab === 'Pipeline') {
        const data = await ghlFetch(`/pipelines/?locationId=${GHL_LOCATION}`);
        setPipelines(data.pipelines || []);
      } else if (activeTab === 'Calendar') {
        const data = await ghlFetch(`/appointments/?locationId=${GHL_LOCATION}`);
        setAppointments(data.appointments || []);
      }
    } catch (e) {
      console.warn('[GHL] Load error:', e.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadData(); }, [activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleAddContact = async () => {
    if (!newContact.firstName.trim() || !newContact.email.trim()) {
      Alert.alert('Required', 'First name and email are required.');
      return;
    }
    setAddingContact(true);
    try {
      await ghlPost('/contacts/', {
        locationId: GHL_LOCATION,
        firstName: newContact.firstName.trim(),
        lastName: newContact.lastName.trim(),
        phone: newContact.phone.trim(),
        email: newContact.email.trim(),
        tags: newContact.tags.trim().split(',').map(t => t.trim()).filter(Boolean),
      });
      Alert.alert('Success', 'Contact added to GHL!');
      setNewContact({ firstName: '', lastName: '', phone: '', email: '', tags: '' });
    } catch (e) {
      Alert.alert('Error', 'Failed to add contact. Check your connection.');
    } finally {
      setAddingContact(false);
    }
  };

  const filteredContacts = contacts.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.firstName || '').toLowerCase().includes(q) ||
      (c.lastName || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={[s.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="GHL Command Center" />

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={s.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={GOLD} size="large" />
            <Text style={s.loadingText}>Loading from GHL...</Text>
          </View>
        ) : activeTab === 'Contacts' ? (
          <>
            <TextInput
              style={s.searchInput}
              placeholder="Search contacts..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {filteredContacts.length === 0 ? (
              <Text style={s.emptyText}>No contacts found</Text>
            ) : (
              filteredContacts.map((c, i) => (
                <TouchableOpacity key={c.id || i} style={s.contactCard} activeOpacity={0.8}>
                  <View style={s.contactAvatar}>
                    <Text style={{ fontSize: 18, color: GOLD }}>
                      {(c.firstName || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.contactName}>{c.firstName || ''} {c.lastName || ''}</Text>
                    <Text style={s.contactEmail}>{c.email || 'No email'}</Text>
                    {c.phone && <Text style={s.contactPhone}>{c.phone}</Text>}
                  </View>
                  <Text style={s.chevron}>›</Text>
                </TouchableOpacity>
              ))
            )}
          </>
        ) : activeTab === 'Pipeline' ? (
          pipelines.length === 0 ? (
            <Text style={s.emptyText}>No pipelines found</Text>
          ) : (
            pipelines.map((p, i) => (
              <View key={p.id || i} style={s.pipelineCard}>
                <Text style={s.pipelineName}>{p.name}</Text>
                {p.stages?.map((stage, si) => (
                  <View key={si} style={s.stageRow}>
                    <View style={[s.stageDot, { backgroundColor: GOLD }]} />
                    <Text style={s.stageName}>{stage.name}</Text>
                  </View>
                ))}
              </View>
            ))
          )
        ) : activeTab === 'Calendar' ? (
          appointments.length === 0 ? (
            <Text style={s.emptyText}>No upcoming appointments</Text>
          ) : (
            appointments.map((a, i) => (
              <View key={a.id || i} style={s.apptCard}>
                <Text style={s.apptTitle}>{a.title || 'Appointment'}</Text>
                <Text style={s.apptTime}>{a.startTime ? new Date(a.startTime).toLocaleString() : 'No time set'}</Text>
                {a.contactId && <Text style={s.apptContact}>Contact: {a.contactId}</Text>}
              </View>
            ))
          )
        ) : activeTab === 'Add Contact' ? (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Text style={s.formTitle}>Quick Add Contact</Text>
            {[
              { key: 'firstName', label: 'First Name', required: true },
              { key: 'lastName', label: 'Last Name' },
              { key: 'phone', label: 'Phone', keyboard: 'phone-pad' },
              { key: 'email', label: 'Email', required: true, keyboard: 'email-address' },
              { key: 'tags', label: 'Tags (comma separated)' },
            ].map((field) => (
              <View key={field.key} style={{ marginBottom: 14 }}>
                <Text style={s.fieldLabel}>
                  {field.label} {field.required && <Text style={{ color: '#EF4444' }}>*</Text>}
                </Text>
                <TextInput
                  style={s.fieldInput}
                  placeholder={field.label}
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={newContact[field.key]}
                  onChangeText={(v) => setNewContact(prev => ({ ...prev, [field.key]: v }))}
                  keyboardType={field.keyboard || 'default'}
                  autoCapitalize={field.key === 'email' ? 'none' : 'words'}
                />
              </View>
            ))}
            <TouchableOpacity style={s.addBtn} onPress={handleAddContact} disabled={addingContact}>
              {addingContact ? (
                <ActivityIndicator color={BG} />
              ) : (
                <Text style={s.addBtnText}>Add to GHL</Text>
              )}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  tabRow: { maxHeight: 46, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  tab: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  tabActive: { backgroundColor: 'rgba(212,175,55,0.15)', borderWidth: 1, borderColor: GOLD },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  tabTextActive: { color: GOLD },
  body: { flex: 1, padding: 16 },
  loadingWrap: { alignItems: 'center', paddingTop: 60 },
  loadingText: { fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 12 },
  emptyText: { textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 40 },

  searchInput: {
    backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: '#fff', fontSize: 14, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },

  contactCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: CARD,
    borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  contactAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  contactName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  contactEmail: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  contactPhone: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 1 },
  chevron: { fontSize: 20, color: 'rgba(255,255,255,0.2)' },

  pipelineCard: {
    backgroundColor: CARD, borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  pipelineName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
  stageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stageDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  stageName: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },

  apptCard: {
    backgroundColor: CARD, borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  apptTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  apptTime: { fontSize: 12, color: GOLD, marginTop: 4 },
  apptContact: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 },

  formTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
  fieldInput: {
    backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: '#fff', fontSize: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  addBtn: {
    backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  addBtnText: { fontSize: 16, fontWeight: '800', color: BG },
});
