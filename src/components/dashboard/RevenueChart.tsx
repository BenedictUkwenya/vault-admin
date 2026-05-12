'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

const SUBSCRIPTION_PRICE = 25;

interface Props {
  subscriptions: { created_at: string }[];
}

function buildChartData(subscriptions: { created_at: string }[]) {
  const map: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const key = format(subDays(new Date(), i), 'EEE');
    map[key] = 0;
  }
  for (const sub of subscriptions) {
    try {
      const key = format(parseISO(sub.created_at), 'EEE');
      if (key in map) map[key]++;
    } catch {}
  }
  return Object.entries(map).map(([day, count]) => ({
    day,
    revenue: count * SUBSCRIPTION_PRICE,
  }));
}

export default function RevenueChart({ subscriptions }: Props) {
  const data = buildChartData(subscriptions);

  return (
    <div className="bg-vault-card rounded-2xl border border-vault-border p-5">
      <h3 className="font-display font-semibold text-white mb-4">New Subscription Revenue (7d)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252740" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#9B9FBA', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9B9FBA', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#171A2E', border: '1px solid #252740', borderRadius: 12, color: '#fff' }}
            cursor={{ fill: '#252740' }}
            formatter={(v: number) => [`$${v}`, 'Revenue']}
          />
          <Bar dataKey="revenue" fill="#6C63FF" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
