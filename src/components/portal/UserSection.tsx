'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { partnerApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';

type Props = { section: string };

export function UserSection({ section }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [referrals, setReferrals] = useState<Record<string, unknown> | null>(null);
  const [wallet, setWallet] = useState<Record<string, unknown> | null>(null);
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([]);
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    load();
  }, [section]);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(p);

    if (section === 'referrals') {
      const r = await partnerApi.referralsStats().catch(() => null);
      setReferrals(r as Record<string, unknown> | null);
    }
    if (section === 'wallet') {
      const w = await partnerApi.walletHistory().catch(() => null);
      setWallet(w as Record<string, unknown> | null);
    }
    if (section === 'notifications') {
      const n = await partnerApi.notifications().catch(() => ({ notifications: [] }));
      setNotifications((n as { notifications?: Record<string, unknown>[] }).notifications ?? []);
    }
    if (section === 'bookings') {
      const { data } = await supabase.from('bookings').select('*, businesses(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
      setBookings(data ?? []);
    }
    setLoading(false);
  }

  if (loading) return <p className="text-vault-textSecondary">Loading…</p>;

  if (section === 'dashboard') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-white">Welcome, {(profile?.full_name as string) ?? 'Member'}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Membership', value: profile?.membership_tier ?? 'free' },
            { label: 'Streak', value: profile?.streak_count ?? 0 },
            { label: 'Referrals', value: profile?.referral_count ?? 0 },
            { label: 'Savings', value: `$${profile?.total_savings ?? 0}` },
          ].map((s) => (
            <div key={s.label} className="bg-vault-card border border-vault-border rounded-xl p-4">
              <p className="text-vault-textSecondary text-sm">{s.label}</p>
              <p className="text-2xl font-bold text-white mt-1 capitalize">{String(s.value)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'membership') {
    return (
      <div className="bg-vault-card border border-vault-border rounded-2xl p-6 space-y-2">
        <h2 className="text-xl font-display font-bold text-white">Membership</h2>
        <p className="text-white capitalize">Plan: {profile?.membership_tier as string ?? 'free'}</p>
        <p className="text-vault-textSecondary">Expires: {profile?.membership_expires_at ? formatDate(profile.membership_expires_at as string) : '—'}</p>
        <p className="text-vault-textSecondary text-sm">Referral code: {profile?.referral_code as string ?? '—'}</p>
      </div>
    );
  }

  if (section === 'bookings') {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-display font-bold text-white">My Bookings</h2>
        {bookings.length === 0 ? <p className="text-vault-textSecondary">No bookings yet.</p> : bookings.map((b) => (
          <div key={b.id as string} className="bg-vault-card border border-vault-border rounded-xl p-4">
            <p className="text-white">{(b.businesses as { name?: string })?.name ?? 'Business'}</p>
            <p className="text-vault-textSecondary text-sm">{b.status as string} · {b.requested_date as string}</p>
          </div>
        ))}
      </div>
    );
  }

  if (section === 'wallet') {
    const history = (wallet?.history as Record<string, unknown>[]) ?? [];
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-display font-bold text-white">Wallet</h2>
        <p className="text-vault-textSecondary">Total savings tracked via redemptions</p>
        {history.length === 0 ? <p className="text-vault-textSecondary">No redemption history.</p> : history.map((h) => (
          <div key={h.id as string} className="bg-vault-card border border-vault-border rounded-xl p-4 flex justify-between">
            <span className="text-white">{(h.businesses as { name?: string })?.name ?? 'Deal'}</span>
            <span className="text-green-400">${h.savings_amount as number}</span>
          </div>
        ))}
      </div>
    );
  }

  if (section === 'referrals') {
    return (
      <div className="bg-vault-card border border-vault-border rounded-2xl p-6 space-y-3">
        <h2 className="text-xl font-display font-bold text-white">Referrals</h2>
        <p className="text-white">Code: {(referrals?.referral_code as string) ?? (profile?.referral_code as string) ?? '—'}</p>
        <p className="text-vault-textSecondary">Completed: {(referrals?.completed_referrals as number) ?? 0}</p>
        <p className="text-vault-textSecondary">Pending: {(referrals?.pending_referrals as number) ?? 0}</p>
      </div>
    );
  }

  if (section === 'notifications') {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-display font-bold text-white">Notifications</h2>
        {notifications.length === 0 ? <p className="text-vault-textSecondary">No notifications.</p> : notifications.map((n) => (
          <div key={n.id as string} className={`bg-vault-card border border-vault-border rounded-xl p-4 ${n.is_read ? 'opacity-60' : ''}`}>
            <p className="text-white font-medium">{n.title as string}</p>
            <p className="text-vault-textSecondary text-sm">{n.body as string}</p>
          </div>
        ))}
      </div>
    );
  }

  if (section === 'settings') {
    return (
      <div className="bg-vault-card border border-vault-border rounded-2xl p-6 space-y-2">
        <h2 className="text-xl font-display font-bold text-white">Settings</h2>
        <p className="text-white">{profile?.full_name as string}</p>
        <p className="text-vault-textSecondary">{profile?.email as string}</p>
        <p className="text-vault-textSecondary text-sm">City: {profile?.city as string ?? '—'}</p>
        <p className="text-vault-textHint text-xs mt-4">Account deletion is available in the Vault mobile app.</p>
      </div>
    );
  }

  return null;
}
