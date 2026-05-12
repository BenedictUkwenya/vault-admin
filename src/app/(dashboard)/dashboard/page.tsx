import { createServerClient } from '@/lib/supabase-server';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentBusinesses from '@/components/dashboard/RecentBusinesses';
import RevenueChart from '@/components/dashboard/RevenueChart';

async function getStats(supabase: ReturnType<typeof createServerClient>) {
  const [users, businesses, deals, subscriptions] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('businesses').select('id', { count: 'exact', head: true }),
    supabase.from('deals').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  return {
    totalUsers: users.count ?? 0,
    totalBusinesses: businesses.count ?? 0,
    activeDeals: deals.count ?? 0,
    activeSubscriptions: subscriptions.count ?? 0,
  };
}

export default async function DashboardPage() {
  const supabase = createServerClient();
  const stats = await getStats(supabase);

  const { data: pendingBusinesses } = await supabase
    .from('businesses')
    .select('id, name, city, logo_url, created_at')
    .eq('is_approved', false)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recentSubscriptions } = await supabase
    .from('subscriptions')
    .select('id, created_at, profiles(full_name, email)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: chartSubscriptions } = await supabase
    .from('subscriptions')
    .select('created_at')
    .eq('status', 'active')
    .gte('created_at', sevenDaysAgo);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
        <p className="text-vault-textSecondary text-sm mt-1">Welcome back. Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={stats.totalUsers} icon="users" color="primary" />
        <StatsCard title="Businesses" value={stats.totalBusinesses} icon="building" color="accent" />
        <StatsCard title="Active Deals" value={stats.activeDeals} icon="tag" color="success" />
        <StatsCard title="Subscribers" value={stats.activeSubscriptions} icon="crown" color="info" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart subscriptions={chartSubscriptions ?? []} />
        </div>
        <div>
          <RecentBusinesses businesses={pendingBusinesses ?? []} />
        </div>
      </div>
    </div>
  );
}
