'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

interface Props {
  users: { created_at: string }[];
  redemptions: { created_at: string; savings_amount: number }[];
  subscriptions: { created_at: string; status: string }[];
  topBusinesses: { name: string; active_deals_count: number; total_views: number }[];
}

function groupByDay(items: { created_at: string }[], days = 30) {
  const map: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const key = format(subDays(new Date(), days - 1 - i), 'MMM d');
    map[key] = 0;
  }
  for (const item of items) {
    const key = format(parseISO(item.created_at), 'MMM d');
    if (key in map) map[key]++;
  }
  return Object.entries(map).map(([date, count]) => ({ date, count }));
}

export default function AnalyticsCharts({ users, redemptions, subscriptions, topBusinesses }: Props) {
  const userGrowth = groupByDay(users);
  const redemptionGrowth = groupByDay(redemptions);
  const subGrowth = groupByDay(subscriptions);

  const ttStyle = { background: '#171A2E', border: '1px solid #252740', borderRadius: 12, color: '#fff' };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User signups */}
        <div className="bg-vault-card rounded-2xl border border-vault-border p-5">
          <h3 className="font-display font-semibold text-white mb-4">New Users (30d)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252740" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#9B9FBA', fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: '#9B9FBA', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ttStyle} />
              <Line type="monotone" dataKey="count" stroke="#6C63FF" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Redemptions */}
        <div className="bg-vault-card rounded-2xl border border-vault-border p-5">
          <h3 className="font-display font-semibold text-white mb-4">Redemptions (30d)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={redemptionGrowth} barSize={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252740" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#9B9FBA', fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: '#9B9FBA', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ttStyle} />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Businesses */}
      <div className="bg-vault-card rounded-2xl border border-vault-border p-5">
        <h3 className="font-display font-semibold text-white mb-4">Top Businesses by Views</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topBusinesses.slice(0, 8)} layout="vertical" barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252740" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#9B9FBA', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#9B9FBA', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
            <Tooltip contentStyle={ttStyle} />
            <Bar dataKey="total_views" fill="#FFB800" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
