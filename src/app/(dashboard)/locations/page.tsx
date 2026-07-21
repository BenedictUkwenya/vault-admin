'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

type Market = {
  id: string;
  name: string;
  city: string;
  state: string | null;
  country: string;
  is_launched: boolean;
  waitlist_count: number;
};

export default function LocationsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', city: '', state: '', country: 'US' });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch<{ markets: Market[] }>('/admin/locations');
      setMarkets(data.markets);
    } catch {
      setMarkets([]);
    }
    setLoading(false);
  }

  async function addMarket(e: React.FormEvent) {
    e.preventDefault();
    await apiFetch('/admin/locations', { method: 'POST', body: JSON.stringify(form) });
    setForm({ name: '', city: '', state: '', country: 'US' });
    load();
  }

  async function toggleLaunch(id: string, is_launched: boolean) {
    await apiFetch(`/admin/locations/${id}`, { method: 'PATCH', body: JSON.stringify({ is_launched: !is_launched }) });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">Markets & Locations</h1>

      <form onSubmit={addMarket} className="bg-vault-card border border-vault-border rounded-2xl p-4 flex flex-wrap gap-3">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Market name" className="flex-1 min-w-[140px] bg-vault-surface border border-vault-border rounded-xl px-3 py-2 text-white text-sm" required />
        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="flex-1 min-w-[120px] bg-vault-surface border border-vault-border rounded-xl px-3 py-2 text-white text-sm" required />
        <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="w-24 bg-vault-surface border border-vault-border rounded-xl px-3 py-2 text-white text-sm" />
        <button type="submit" className="bg-vault-primary text-white px-4 py-2 rounded-xl text-sm font-medium">Add Market</button>
      </form>

      <div className="bg-vault-card border border-vault-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-vault-surface text-vault-textSecondary">
            <tr>
              <th className="text-left px-4 py-3">Market</th>
              <th className="text-left px-4 py-3">City</th>
              <th className="text-left px-4 py-3">Waitlist</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-vault-textSecondary">Loading…</td></tr>
            ) : markets.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-vault-textSecondary">No markets yet. Add your first launch city.</td></tr>
            ) : markets.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 text-white">{m.name}</td>
                <td className="px-4 py-3 text-vault-textSecondary">{m.city}{m.state ? `, ${m.state}` : ''}</td>
                <td className="px-4 py-3 text-vault-textSecondary">{m.waitlist_count}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${m.is_launched ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {m.is_launched ? 'Launched' : 'Coming soon'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleLaunch(m.id, m.is_launched)} className="text-vault-primary text-xs hover:underline">
                    {m.is_launched ? 'Mark coming soon' : 'Launch market'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
