/* ═══════════════════════════════════════════════════
   ERROR BOUNDARY — Catches JS runtime crashes
   Shows the actual error on screen instead of crashing
═══════════════════════════════════════════════════ */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={s.container}>
          <View style={s.header}>
            <Text style={s.title}>Something went wrong</Text>
            <Text style={s.sub}>SaintSal™ Labs encountered an error</Text>
          </View>
          <ScrollView style={s.scroll} contentContainerStyle={{ padding: 16 }}>
            <Text style={s.errorLabel}>Error:</Text>
            <Text style={s.errorText}>{this.state.error?.toString()}</Text>
            {this.state.errorInfo?.componentStack ? (
              <>
                <Text style={[s.errorLabel, { marginTop: 16 }]}>Component Stack:</Text>
                <Text style={s.stackText}>{this.state.errorInfo.componentStack}</Text>
              </>
            ) : null}
          </ScrollView>
          <TouchableOpacity style={s.resetBtn} onPress={this.handleReset}>
            <Text style={s.resetText}>Try Again</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { padding: 24, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.15)' },
  title: { fontSize: 22, fontWeight: '800', color: '#D4AF37', marginBottom: 4 },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  scroll: { flex: 1 },
  errorLabel: { fontSize: 13, fontWeight: '700', color: '#D4AF37', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  errorText: { fontSize: 14, color: '#FF6B6B', lineHeight: 20, fontFamily: 'Courier' },
  stackText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 16, fontFamily: 'Courier' },
  resetBtn: { margin: 16, padding: 16, alignItems: 'center', backgroundColor: '#D4AF37', borderRadius: 12 },
  resetText: { fontSize: 16, fontWeight: '800', color: '#0A0A0A' },
});
