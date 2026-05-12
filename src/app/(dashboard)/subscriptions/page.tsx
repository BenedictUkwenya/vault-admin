import { createServerClient } from '@/lib/supabase-server';
import { formatDate } from '@/lib/utils';

export default async function SubscriptionsPage() {
  const supabase = createServerClient();

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(100);

  const active = subscriptions?.filter((s) => s.status === 'active').length ?? 0;
  const canceled = subscriptions?.filter((s) => s.status === 'canceled').length ?? 0;
  const revenue = active * 25;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">Subscriptions</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active', value: active, color: 'text-green-400 bg-green-500/10' },
          { label: 'Canceled', value: canceled, color: 'text-red-400 bg-red-500/10' },
          { label: 'MRR', value: `$${revenue.toLocaleString()}`, color: 'text-yellow-400 bg-yellow-500/10' },
        ].map((s) => (
          <div key={s.label} className="bg-vault-card rounded-2xl border border-vault-border p-5">
            <p className="text-vault-textSecondary text-sm">{s.label}</p>
            <p className={`text-3xl font-display font-bold mt-1 ${s.color.split(' ')[0]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-vault-card rounded-2xl border border-vault-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-vault-surface text-vault-textSecondary">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Period End</th>
                <th className="text-left px-4 py-3">Cancel at End</th>
                <th className="text-left px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vault-border">
              {(subscriptions ?? []).map((s) => {
                const profile = s.profiles as { full_name: string; email: string } | null;
                return (
                  <tr key={s.id} className="hover:bg-vault-elevated/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{profile?.full_name || '—'}</p>
                      <p className="text-vault-textHint text-xs">{profile?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        s.status === 'canceled' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-vault-textSecondary capitalize">{s.subscription_type || 'member'}</td>
                    <td className="px-4 py-3 text-vault-textSecondary">{s.current_period_end ? formatDate(s.current_period_end) : '—'}</td>
                    <td className="px-4 py-3 text-vault-textSecondary">{s.cancel_at_period_end ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-vault-textSecondary">{formatDate(s.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
