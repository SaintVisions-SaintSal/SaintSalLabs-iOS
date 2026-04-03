/* ═══════════════════════════════════════════════════
   SAINTSALLABS — SUPABASE CLIENT
   Shared auth + billing source of truth
   Connected to: euxrlpuegeiggedqbkiv.supabase.co
═══════════════════════════════════════════════════ */
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SUPABASE_URL = 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';

/* ── SecureStore adapter for Supabase session persistence ── */
const SecureStoreAdapter = {
  getItem: async (key) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  removeItem: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

/* ── Initialize Supabase client ────────────────────── */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Required for React Native
  },
});

/* ── Auth helpers ──────────────────────────────────── */

/** Sign in with email + password */
export const signInWithPassword = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

/** Sign up with email + password */
export const signUpWithPassword = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: 'saintsallabs://auth/callback',
    },
  });
  if (error) throw error;
  return data;
};

/** Sign in with magic link (email OTP) */
export const signInWithMagicLink = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'saintsallabs://auth/callback',
    },
  });
  if (error) throw error;
  return data;
};

/** Sign in with Google OAuth */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'saintsallabs://auth/callback',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) throw error;
  return data;
};

/** Sign out */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/** Get current session */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

/** Get current user */
export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

/** Get user profile from profiles table (legacy compat) */
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  // Return null gracefully if no profile yet (new user)
  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
};

/** Get user_profiles row (view aliasing profiles — same data, iOS-compat field names)
 *  Fields: user_id, tier, role, compute_minutes_used, stripe_customer_id, etc.
 */
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
};

/** Get the current user's full profile (convenience wrapper) */
export const getCurrentUserProfile = async () => {
  const user = await getUser().catch(() => null);
  if (!user) return null;
  return getUserProfile(user.id);
};

/** Tier compute limits (matches saintsal.ai webapp) */
export const TIER_LIMITS = {
  free:       100,
  starter:    500,
  pro:        2000,
  teams:      10000,
  enterprise: Infinity,
};

/** Stripe Price IDs (live) — shared across both platforms */
export const STRIPE_PRICE_IDS = {
  free:       'price_1T7p1tL47U80vDLAe9aWVKA0',
  starter:    'price_1T7p1sL47U80vDLAgU2shcQO',
  pro:        'price_1T7p1tL47U80vDLAVC0N4N4J',
  teams:      'price_1T7p1uL47U80vDLA9QF62BKS',
  enterprise: 'price_1T7p1uL47U80vDLAR4Wk6uW0',
};

/** Deduct compute seconds after an AI call — hits MCP gateway */
export const deductCompute = async (seconds) => {
  try {
    const session = await supabase.auth.getSession();
    const token = session?.data?.session?.access_token;
    const res = await fetch(
      'https://www.saintsallabs.com/api/metering/deduct',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sal-key': 'saintvision_gateway_2025',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ seconds }),
      }
    );
    if (!res.ok) throw new Error(`Compute deduct failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    // Non-fatal — log but don't block UI
    console.warn('[compute] deduct error:', err.message);
    return null;
  }
};

/** Check if user has compute remaining
 *  Works with both profiles table (credits_remaining) and user_profiles view (monthly_requests)
 */
export const hasComputeLeft = (userProfile) => {
  if (!userProfile) return false;
  const tier = userProfile.tier || userProfile.plan_tier || userProfile.role || 'free';
  if (tier === 'enterprise') return true;
  const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.free;
  // Support both field naming conventions
  const used = userProfile.monthly_requests ?? userProfile.compute_minutes_used ?? 0;
  const remaining = userProfile.credits_remaining ?? (limit - used);
  return remaining > 0;
};

/** Get credits remaining for a user profile */
export const getCreditsRemaining = (userProfile) => {
  if (!userProfile) return 0;
  const tier = userProfile.tier || userProfile.plan_tier || 'free';
  if (tier === 'enterprise') return Infinity;
  if (userProfile.credits_remaining != null) return userProfile.credits_remaining;
  const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.free;
  const used = userProfile.monthly_requests ?? 0;
  return Math.max(0, limit - used);
};

/** Upsert user profile (for Business DNA onboarding) */
export const upsertProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...profileData, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Listen to auth state changes */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

export default supabase;
