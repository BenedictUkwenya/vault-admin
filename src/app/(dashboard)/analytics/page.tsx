import { createServerClient } from '@/lib/supabase-server';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';

export default async function AnalyticsPage() {
  const supabase = createServerClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [users, redemptions, subscriptions, topBusinesses] = await Promise.all([
    supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo),
    supabase
      .from('redemptions')
      .select('created_at, savings_amount')
      .gte('redeemed_at', thirtyDaysAgo),
    supabase
      .from('subscriptions')
      .select('created_at, status')
      .gte('created_at', thirtyDaysAgo),
    supabase
      .from('businesses_with_stats')
      .select('name, active_deals_count, total_views')
      .eq('is_approved', true)
      .order('total_views', { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">Analytics</h1>
      <AnalyticsCharts
        users={users.data ?? []}
        redemptions={redemptions.data ?? []}
        subscriptions={subscriptions.data ?? []}
        topBusinesses={topBusinesses.data ?? []}
      />
    </div>
  );
}
