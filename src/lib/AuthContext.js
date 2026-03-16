/* ═══════════════════════════════════════════════════
   SAINTSALLABS — AUTH CONTEXT
   Wraps entire app with Supabase session awareness
   Auto-routes to login when unauthenticated
═══════════════════════════════════════════════════ */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getProfile, getUserProfile, onAuthStateChange, hasComputeLeft, TIER_LIMITS, deductCompute } from './supabase';

const AuthContext = createContext({
  user: null,
  profile: null,
  userProfile: null,   // shared user_profiles row (tier, compute, role)
  session: null,
  loading: true,
  tier: 'free',
  computeLeft: 100,
  canUseAI: false,
  signOut: async () => {},
  refreshUserProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [profile, setProfile]         = useState(null);
  const [userProfile, setUserProfile] = useState(null);  // shared user_profiles
  const [session, setSession]         = useState(null);
  const [loading, setLoading]         = useState(true);

  const loadUserData = async (u) => {
    if (!u) return;
    try {
      const [prof, uProf] = await Promise.allSettled([
        getProfile(u.id),
        getUserProfile(u.id),
      ]);
      if (prof.status === 'fulfilled') setProfile(prof.value);
      if (uProf.status === 'fulfilled') setUserProfile(uProf.value);
    } catch {}
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    try {
      const up = await getUserProfile(user.id);
      setUserProfile(up);
    } catch {}
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadUserData(s.user);
      setLoading(false);
    });

    const { data: { subscription } } = onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadUserData(s.user);
      } else {
        setProfile(null);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setUserProfile(null);
    setSession(null);
  };

  // Derived tier/compute values
  const tier        = userProfile?.tier || userProfile?.role || 'free';
  const computeUsed = userProfile?.compute_minutes_used ?? 0;
  const computeLimit = TIER_LIMITS[tier] ?? TIER_LIMITS.free;
  const computeLeft = Math.max(0, computeLimit - computeUsed);
  const canUseAI    = computeLeft > 0;

  const handleDeductCompute = async (seconds) => {
    if (!user) return;
    try {
      await deductCompute(seconds);
      await refreshUserProfile();
    } catch {}
  };

  return (
    <AuthContext.Provider value={{
      user, profile, userProfile, session, loading,
      tier, computeLeft, canUseAI,
      signOut: handleSignOut,
      refreshUserProfile,
      deductCompute: handleDeductCompute,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
