# /bootstrap — Scaffold New Screen (iOS)

Scaffold a new screen following SaintSal Labs iOS conventions.

## Usage
`/bootstrap [screen-name] [router-group: stack|tabs|auth]`

## Creates: `app/(stack)/[screen-name].js`

```javascript
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Image, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const GOLD = '#D4AF37';
const BG = '#0A0A0A';
const CARD_BG = '#141416';

export default function ScreenNameScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  return (
    <SafeAreaView style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Image
          source={require('../../assets/logo-80.png')}
          style={{ width: 28, height: 28, borderRadius: 14 }}
        />
        <Text style={s.title}>Screen Name</Text>
      </View>

      {/* Content */}
      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={GOLD} style={{ marginTop: 40 }} />
        ) : (
          <View style={s.card}>
            <Text style={s.cardText}>Content here</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.15)',
  },
  backBtn: { marginRight: 10, padding: 4 },
  backText: { color: GOLD, fontSize: 20 },
  title: { fontSize: 18, fontWeight: '800', color: '#fff', marginLeft: 10 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  card: {
    backgroundColor: CARD_BG, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', marginBottom: 12,
  },
  cardText: { color: 'rgba(255,255,255,0.9)', fontSize: 15 },
});
```

## After Scaffold
- Register in `app/(stack)/_layout.js` if not auto-discovered
- Add navigation entry to More sheet in `app/(tabs)/_layout.js` if user-facing
- Run Metro compile gate to confirm 0 errors
