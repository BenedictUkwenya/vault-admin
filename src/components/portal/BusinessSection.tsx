'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { partnerApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';

type Props = { section: string };

export function BusinessSection({ section }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Record<string, unknown> | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [deals, setDeals] = useState<Record<string, unknown>[]>([]);
  const [redemptions, setRedemptions] = useState<Record<string, unknown>[]>([]);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [section]);

  async function load() {
    setLoading(true);
    try {
      const biz = await partnerApi.businessMy().catch(() => null);
      setBusiness(biz as Record<string, unknown> | null);

      if (section === 'analytics') {
        const a = await partnerApi.businessAnalytics().catch(() => null);
        setAnalytics(a as Record<string, unknown> | null);
      }
      if (section === 'bookings') {
        const b = await partnerApi.businessBookings().catch(() => ({ bookings: [] }));
        setBookings((b as { bookings?: Record<string, unknown>[] }).bookings ?? []);
      }
      if (section === 'deals') {
        const d = await partnerApi.businessDeals().catch(() => ({ deals: [] }));
        setDeals((d as { deals?: Record<string, unknown>[] }).deals ?? []);
      }
      if (section === 'redemptions' && biz && (biz as { id?: string }).id) {
        const { data } = await supabase
          .from('redemptions')
          .select('*, profiles(full_name), deals(title)')
          .eq('business_id', (biz as { id: string }).id)
          .order('redeemed_at', { ascending: false })
          .limit(50);
        setRedemptions(data ?? []);
      }
      if (section === 'billing') {
        const p = await partnerApi.subscriptionsPortal().catch(() => null);
        setPortalUrl((p as { url?: string })?.url ?? null);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="text-vault-textSecondary">Loading…</p>;

  if (!business && section !== 'profile') {
    return (
      <div className="bg-vault-card border border-vault-border rounded-2xl p-6">
        <h2 className="text-xl font-display font-bold text-white">No business registered</h2>
        <p className="text-vault-textSecondary mt-2">Register your business in the Vault mobile app to use this portal.</p>
      </div>
    );
  }

  if (section === 'dashboard') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-white">{(business?.name as string) ?? 'Dashboard'}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Views', value: business?.view_count ?? 0 },
            { label: 'Bookings', value: business?.booking_count ?? 0 },
            { label: 'Redemptions', value: business?.redemption_count ?? 0 },
            { label: 'Approved', value: business?.is_approved ? 'Yes' : 'Pending' },
          ].map((s) => (
            <div key={s.label} className="bg-vault-card border border-vault-border rounded-xl p-4">
              <p className="text-vault-textSecondary text-sm">{s.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{String(s.value)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'profile') {
    return (
      <div className="bg-vault-card border border-vault-border rounded-2xl p-6 space-y-3">
        <h2 className="text-xl font-display font-bold text-white">Business Profile</h2>
        {business ? (
          <>
            <p className="text-white font-medium">{business.name as string}</p>
            <p className="text-vault-textSecondary">{business.city as string} · {business.category as string}</p>
            <p className="text-vault-textSecondary text-sm">{business.description as string}</p>
            <p className="text-sm">Status: {business.is_approved ? 'Approved' : 'Pending approval'}</p>
          </>
        ) : (
          <p className="text-vault-textSecondary">No business profile yet.</p>
        )}
      </div>
    );
  }

  if (section === 'deals') {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-display font-bold text-white">Your Deals</h2>
        {deals.length === 0 ? (
          <p className="text-vault-textSecondary">No deals yet. Create deals in the mobile app.</p>
        ) : (
          deals.map((d) => (
            <div key={d.id as string} className="bg-vault-card border border-vault-border rounded-xl p-4 flex justify-between">
              <div>
                <p className="text-white font-medium">{d.title as string}</p>
                <p className="text-vault-textSecondary text-sm">{d.discount_percentage as number}% off</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${d.is_active ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {d.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))
        )}
      </div>
    );
  }

  if (section === 'bookings') {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-display font-bold text-white">Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-vault-textSecondary">No booking requests.</p>
        ) : (
          bookings.map((b) => (
            <div key={b.id as string} className="bg-vault-card border border-vault-border rounded-xl p-4">
              <p className="text-white">{b.guest_name as string ?? 'Guest'}</p>
              <p className="text-vault-textSecondary text-sm">{b.status as string} · {b.requested_date as string}</p>
            </div>
          ))
        )}
      </div>
    );
  }

  if (section === 'redemptions') {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-display font-bold text-white">Recent Redemptions</h2>
        {redemptions.length === 0 ? (
          <p className="text-vault-textSecondary">No redemptions yet.</p>
        ) : (
          redemptions.map((r) => (
            <div key={r.id as string} className="bg-vault-card border border-vault-border rounded-xl p-4">
              <p className="text-white">{(r.profiles as { full_name?: string })?.full_name ?? 'Member'}</p>
              <p className="text-vault-textSecondary text-sm">{(r.deals as { title?: string })?.title} · {formatDate(r.redeemed_at as string)}</p>
            </div>
          ))
        )}
      </div>
    );
  }

  if (section === 'analytics') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Views', value: analytics?.total_views ?? business?.view_count ?? 0 },
          { label: 'Bookings', value: analytics?.total_bookings ?? 0 },
          { label: 'Redemptions', value: analytics?.total_redemptions ?? 0 },
          { label: 'Savings Generated', value: `$${analytics?.total_savings ?? 0}` },
        ].map((s) => (
          <div key={s.label} className="bg-vault-card border border-vault-border rounded-xl p-4">
            <p className="text-vault-textSecondary text-sm">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{String(s.value)}</p>
          </div>
        ))}
      </div>
    );
  }

  if (section === 'billing') {
    return (
      <div className="bg-vault-card border border-vault-border rounded-2xl p-6">
        <h2 className="text-xl font-display font-bold text-white mb-3">Billing</h2>
        {portalUrl ? (
          <a href={portalUrl} target="_blank" rel="noreferrer" className="inline-block bg-vault-primary text-white px-4 py-2 rounded-xl">
            Open Stripe Billing Portal
          </a>
        ) : (
          <p className="text-vault-textSecondary">No active subscription billing portal. Subscribe via the mobile app.</p>
        )}
      </div>
    );
  }

  return null;
}
