'use client';

import { useEffect, useState } from 'react';
import { partnerApi } from '@/lib/api-client';

type Props = { section: string };

export function AmbassadorSection({ section }: Props) {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [referrals, setReferrals] = useState<Record<string, unknown>[]>([]);
  const [rewards, setRewards] = useState<Record<string, unknown> | null>(null);
  const [leaderboard, setLeaderboard] = useState<Record<string, unknown>[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    load();
  }, [section]);

  async function load() {
    setLoading(true);
    try {
      if (section === 'dashboard' || section === 'campaigns') {
        const d = await partnerApi.ambassadorDashboard().catch(() => null);
        setDashboard(d as Record<string, unknown> | null);
      }
      if (section === 'campaigns') {
        const c = await partnerApi.ambassadorDashboard().catch(() => null);
        const code = (c as { profile?: { referral_code?: string } })?.profile?.referral_code;
        setCampaigns([{
          id: 'default',
          name: 'Vault Member Invite',
          referral_code: code,
          share_url: code ? `https://joinvault.app/ref/${code}` : null,
        }]);
      }
      if (section === 'referrals') {
        const r = await partnerApi.ambassadorReferrals().catch(() => ({ referrals: [] }));
        setReferrals((r as { referrals?: Record<string, unknown>[] }).referrals ?? []);
      }
      if (section === 'rewards') {
        const rw = await partnerApi.ambassadorRewards().catch(() => null);
        setRewards(rw as Record<string, unknown> | null);
      }
      if (section === 'leaderboard') {
        const lb = await partnerApi.ambassadorLeaderboard().catch(() => ({ leaderboard: [] }));
        setLeaderboard((lb as { leaderboard?: Record<string, unknown>[] }).leaderboard ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="text-vault-textSecondary">Loading…</p>;

  if (section === 'dashboard') {
    const stats = dashboard?.stats as Record<string, number> | undefined;
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-white">Ambassador Dashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Referrals', value: stats?.total_referrals ?? 0 },
            { label: 'Completed', value: stats?.completed_referrals ?? 0 },
            { label: 'Pending', value: stats?.pending_referrals ?? 0 },
            { label: 'Est. Rewards', value: stats?.estimated_rewards ?? 0 },
          ].map((s) => (
            <div key={s.label} className="bg-vault-card border border-vault-border rounded-xl p-4">
              <p className="text-vault-textSecondary text-sm">{s.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'campaigns') {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-display font-bold text-white">Campaigns</h2>
        {campaigns.map((c) => (
          <div key={c.id as string} className="bg-vault-card border border-vault-border rounded-xl p-4">
            <p className="text-white font-medium">{c.name as string}</p>
            <p className="text-vault-textSecondary text-sm">Code: {c.referral_code as string ?? '—'}</p>
            {c.share_url ? (
              <a href={c.share_url as string} className="text-vault-primary text-sm mt-2 inline-block">{c.share_url as string}</a>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  if (section === 'referrals') {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-display font-bold text-white">Referral Performance</h2>
        {referrals.length === 0 ? (
          <p className="text-vault-textSecondary">No referrals yet. Share your invite link!</p>
        ) : (
          referrals.map((r) => (
            <div key={r.id as string} className="bg-vault-card border border-vault-border rounded-xl p-4 flex justify-between">
              <span className="text-white">{(r.profiles as { full_name?: string })?.full_name ?? 'Member'}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${r.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {r.status as string}
              </span>
            </div>
          ))
        )}
      </div>
    );
  }

  if (section === 'rewards') {
    const ledger = (rewards?.ledger as Record<string, unknown>[]) ?? [];
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-display font-bold text-white">Rewards</h2>
        <p className="text-vault-textSecondary">Completed referrals: {rewards?.completed_referrals as number ?? 0}</p>
        <p className="text-vault-textSecondary">Pending payout: ${rewards?.pending_rewards as number ?? 0}</p>
        {ledger.length === 0 ? (
          <p className="text-vault-textSecondary text-sm">No ledger entries yet.</p>
        ) : (
          ledger.map((entry) => (
            <div key={entry.id as string} className="bg-vault-card border border-vault-border rounded-xl p-4 flex justify-between">
              <span className="text-white capitalize">{entry.reward_type as string}</span>
              <span className="text-green-400">${entry.amount as number} · {entry.status as string}</span>
            </div>
          ))
        )}
      </div>
    );
  }

  if (section === 'payouts') {
    return (
      <div className="bg-vault-card border border-vault-border rounded-2xl p-6">
        <h2 className="text-xl font-display font-bold text-white mb-2">Payouts</h2>
        <p className="text-vault-textSecondary">Payout automation is coming soon. Contact admin for manual adjustments.</p>
      </div>
    );
  }

  if (section === 'leaderboard') {
    return (
      <div className="space-y-2">
        <h2 className="text-xl font-display font-bold text-white mb-3">Leaderboard</h2>
        {leaderboard.map((entry, i) => (
          <div key={entry.id as string} className="bg-vault-card border border-vault-border rounded-xl p-4 flex items-center gap-4">
            <span className="text-vault-primary font-bold w-6">#{i + 1}</span>
            <div className="flex-1">
              <p className="text-white">{entry.full_name as string}</p>
              <p className="text-vault-textSecondary text-sm">{entry.referral_count as number} referrals · {entry.streak_count as number} day streak</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
