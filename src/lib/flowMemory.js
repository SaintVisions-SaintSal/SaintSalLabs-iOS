// src/lib/flowMemory.js — remembers where user was
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FlowMemory = {
  async save(key, value) {
    try { await AsyncStorage.setItem(`sal_flow_${key}`, String(value)); } catch {}
  },
  async get(key, defaultValue = null) {
    try { return await AsyncStorage.getItem(`sal_flow_${key}`) || defaultValue; } catch { return defaultValue; }
  },
  async saveScreen(screen) { return FlowMemory.save('last_screen', screen); },
  async saveVertical(v)    { return FlowMemory.save('last_vertical', v); },
  async saveChatId(id)     { return FlowMemory.save('last_chat_id', id); },
  async saveBuildId(id)    { return FlowMemory.save('last_build_id', id); },
  async getLastScreen()    { return FlowMemory.get('last_screen', '/(tabs)'); },
  async getLastVertical()  { return FlowMemory.get('last_vertical', 'all'); },
  async getLastChatId()    { return FlowMemory.get('last_chat_id', null); },
  async getLastBuildId()   { return FlowMemory.get('last_build_id', null); },
};
