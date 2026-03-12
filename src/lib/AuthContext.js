/* ═══════════════════════════════════════════════════
   SAINTSALLABS — AUTH CONTEXT
   Wraps entire app with Supabase session awareness
   Auto-routes to login when unauthenticated
═══════════════════════════════════════════════════ */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getProfile, onAuthStateChange } from './supabase';

const AuthContext = createContext({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        getProfile(s.user.id).then(setProfile).catch(() => {});
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        getProfile(s.user.id).then(setProfile).catch(() => {});
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
