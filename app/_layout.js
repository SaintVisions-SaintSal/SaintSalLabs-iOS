import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#0C0C0F" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0C0C0F' } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
