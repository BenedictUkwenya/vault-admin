import { createServerClient } from '@/lib/supabase-server';
import { formatDate } from '@/lib/utils';
import { Trophy, Users, GitBranch } from 'lucide-react';

interface TopReferrer {
  id: string;
  full_name: string;
  email: string;
  referral_code: string;
  referral_count: number;
  membership_tier: string;
}

interface Referral {
  id: string;
  referral_code: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  referrer: { full_name: string; email: string } | null;
  referred: { full_name: string; email: string } | null;
}

export default async function ReferralsPage() {
  const supabase = createServerClient();

  const [{ data: topReferrers }, { data: recentReferrals }, { count: totalCount }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, referral_code, referral_count, membership_tier')
      .gt('referral_count', 0).order('referral_count', { ascending: false }).limit(20),
    supabase.from('referrals')
      .select('id, referral_code, status, created_at, completed_at, referrer:profiles!referrer_id(full_name, email), referred:profiles!referred_id(full_name, email)')
      .order('created_at', { ascending: false }).limit(50),
    supabase.from('referrals').select('*', { count: 'exact', head: true }),
  ]);

  const completedCount = recentReferrals?.filter(r => r.status === 'completed').length ?? 0;
  const pendingCount = recentReferrals?.filter(r => r.status === 'pending').length ?? 0;

  const STATUS_COLORS: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    expired: 'bg-vault-elevated text-vault-textSecondary',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">Referrals</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Referrals', value: totalCount ?? 0, icon: GitBranch, color: 'text-vault-primary' },
          { label: 'Completed', value: completedCount, icon: Users, color: 'text-green-400' },
          { label: 'Pending', value: pendingCount, icon: Users, color: 'text-yellow-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-vault-card rounded-2xl border border-vault-border p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-vault-surface ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-vault-textSecondary text-sm">{label}</p>
              <p className="text-2xl font-display font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Referrers */}
        <div className="bg-vault-card rounded-2xl border border-vault-border overflow-hidden">
          <div className="px-5 py-4 border-b border-vault-border flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h2 className="font-semibold text-white">Top Referrers</h2>
          </div>
          <div className="divide-y divide-vault-border">
            {(topReferrers ?? []).length === 0 ? (
              <p className="px-5 py-6 text-vault-textSecondary text-sm text-center">No referrers yet</p>
            ) : (topReferrers ?? []).map((r, idx) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                <span className={`text-sm font-bold w-6 text-center ${idx < 3 ? 'text-yellow-400' : 'text-vault-textSecondary'}`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{r.full_name || '—'}</p>
                  <p className="text-vault-textHint text-xs truncate">{r.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-sm">{r.referral_count}</p>
                  <p className="text-vault-textHint text-xs">referrals</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.membership_tier === 'paid' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-vault-surface text-vault-textSecondary'}`}>
                  {r.membership_tier}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="bg-vault-card rounded-2xl border border-vault-border overflow-hidden">
          <div className="px-5 py-4 border-b border-vault-border">
            <h2 className="font-semibold text-white">Recent Referrals</h2>
          </div>
          <div className="divide-y divide-vault-border">
            {(recentReferrals ?? []).length === 0 ? (
              <p className="px-5 py-6 text-vault-textSecondary text-sm text-center">No referrals yet</p>
            ) : (recentReferrals ?? []).slice(0, 20).map((r) => {
              const referrer = Array.isArray(r.referrer) ? r.referrer[0] : r.referrer;
              const referred = Array.isArray(r.referred) ? r.referred[0] : r.referred;
              return (
                <div key={r.id} className="px-5 py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm">
                      <span className="text-vault-textSecondary">From: </span>
                      <span className="text-white font-medium">{referrer?.full_name || '—'}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] ?? 'bg-vault-elevated text-vault-textSecondary'}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-vault-textSecondary">To: </span>
                    <span className="text-white">{referred?.full_name || '—'}</span>
                  </div>
                  <p className="text-vault-textHint text-xs">{formatDate(r.created_at)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
