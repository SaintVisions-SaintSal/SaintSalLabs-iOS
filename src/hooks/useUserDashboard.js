/* ═══════════════════════════════════════════════════
   SAINTSALLABS — USER DASHBOARD HOOK
   Pulls live data: Supabase profile, compute quota,
   saved builds, conversations, image count, API key
═══════════════════════════════════════════════════ */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { API_KEY } from '../lib/api';

const BACKEND_BASE = 'https://saintsal-backend-0mv8.onrender.com';

export function useUserDashboard() {
  const [user, setUser]           = useState(null);
  const [profile, setProfile]     = useState(null);
  const [builds, setBuilds]       = useState([]);
  const [conversations, setConversations] = useState([]);
  const [imageCount, setImageCount] = useState(0);
  const [quota, setQuota]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  /* ── Fetch everything in parallel ─────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      /* 1. Auth user */
      const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      setUser(authUser);

      if (!authUser) { setLoading(false); return; }

      /* 2. Profile (name, tier, api_key, stripe_customer_id) */
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (!profErr) setProfile(prof);

      /* 3. Saved builds */
      const { data: blds } = await supabase
        .from('builder_projects')
        .select('id, name, created_at, updated_at, status')
        .eq('user_id', authUser.id)
        .order('updated_at', { ascending: false })
        .limit(5);
      setBuilds(blds ?? []);

      /* 4. Saved conversations */
      const { data: convs } = await supabase
        .from('conversations')
        .select('id, title, vertical, created_at, updated_at')
        .eq('user_id', authUser.id)
        .order('updated_at', { ascending: false })
        .limit(5);
      setConversations(convs ?? []);

      /* 5. Generated images count */
      const { count } = await supabase
        .from('generated_images')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', authUser.id);
      setImageCount(count ?? 0);

      /* 6. Compute quota from backend */
      try {
        const res = await fetch(`${BACKEND_BASE}/api/website-builder/compute-quota`, {
          headers: {
            'x-sal-key': API_KEY,
            'x-user-id': authUser.id,
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ''}`,
          },
        });
        if (res.ok) setQuota(await res.json());
      } catch {
        /* quota fetch is non-blocking */
      }
    } catch (e) {
      setError(e?.message ?? 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Generate / reveal API key ─────────────────────── */
  const getOrCreateApiKey = useCallback(async () => {
    if (!user) return null;
    /* Return existing key first */
    if (profile?.api_key) return profile.api_key;
    /* Generate a new one */
    const newKey = `sal-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
    await supabase
      .from('profiles')
      .update({ api_key: newKey })
      .eq('id', user.id);
    setProfile(p => ({ ...p, api_key: newKey }));
    return newKey;
  }, [user, profile]);

  /* ── Stripe customer portal session ────────────────── */
  const getPortalUrl = useCallback(async () => {
    if (!user) return 'https://billing.stripe.com';
    try {
      const session = await supabase.auth.getSession();
      const token   = session.data.session?.access_token;
      const res = await fetch(`${BACKEND_BASE}/api/billing/portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sal-key': API_KEY,
          'Authorization': `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({
          user_id:             user.id,
          stripe_customer_id:  profile?.stripe_customer_id,
          return_url:          'saintsallabs://dashboard',
        }),
      });
      if (res.ok) {
        const { url } = await res.json();
        return url ?? 'https://billing.stripe.com';
      }
    } catch {}
    return 'https://billing.stripe.com';
  }, [user, profile]);

  /* ── Derived display values ────────────────────────── */
  const displayName  = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User';
  const displayEmail = user?.email ?? '';
  const tier         = profile?.tier ?? profile?.role ?? 'free';
  const creditsUsed  = quota?.used  ?? 0;
  const creditsTotal = quota?.total ?? profile?.credits_remaining ?? 999993;
  const creditsLeft  = quota?.remaining ?? creditsTotal;

  return {
    user,
    profile,
    builds,
    conversations,
    imageCount,
    quota,
    loading,
    error,
    displayName,
    displayEmail,
    tier,
    creditsUsed,
    creditsTotal,
    creditsLeft,
    getOrCreateApiKey,
    getPortalUrl,
    refresh: load,
  };
}
