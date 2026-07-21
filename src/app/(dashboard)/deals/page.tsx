'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { adminApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Trash2, Star, GraduationCap, Search } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  discount_percentage: number;
  deal_type: string;
  business_name: string;
  business_city: string;
  is_active: boolean;
  is_deal_of_week: boolean;
  is_college_deal: boolean;
  redemption_count: number;
  end_date: string;
  created_at: string;
}

type StatusFilter = 'all' | 'active' | 'inactive' | 'pending' | 'college' | 'this_week';

export default function DealsPage() {
  const supabase = createClient();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => { fetchDeals(); }, [search, statusFilter]);

  async function fetchDeals() {
    setLoading(true);
    let query = supabase.from('deals_with_business').select('*').order('created_at', { ascending: false }).limit(200);
    if (search) query = query.or(`title.ilike.%${search}%,business_name.ilike.%${search}%`);
    if (statusFilter === 'active') query = query.eq('is_active', true);
    if (statusFilter === 'inactive') query = query.eq('is_active', false);
    if (statusFilter === 'pending') query = query.eq('is_active', false);
    if (statusFilter === 'college') query = query.eq('is_college_deal', true);
    if (statusFilter === 'this_week') query = query.eq('is_deal_of_week', true);
    const { data } = await query;
    setDeals(data ?? []);
    setLoading(false);
  }

  async function toggleActive(id: string, current: boolean) {
    if (!current) {
      try { await adminApi.approveDeal(id); } catch { await supabase.from('deals').update({ is_active: true }).eq('id', id); }
    } else {
      try { await adminApi.rejectDeal(id); } catch { await supabase.from('deals').update({ is_active: false }).eq('id', id); }
    }
    fetchDeals();
  }

  async function toggleDealOfWeek(id: string, current: boolean) {
    await supabase.from('deals').update({ is_deal_of_week: !current }).eq('id', id);
    fetchDeals();
  }

  async function toggleCollegeDeal(id: string, current: boolean) {
    await supabase.from('deals').update({ is_college_deal: !current }).eq('id', id);
    fetchDeals();
  }

  async function deleteDeal(id: string) {
    if (!confirm('Delete this deal permanently?')) return;
    try { await adminApi.deleteDeal(id); } catch { await supabase.from('deals').delete().eq('id', id); }
    fetchDeals();
  }

  const filterLabels: Record<StatusFilter, string> = {
    all: 'All', active: 'Active', inactive: 'Inactive', pending: 'Pending Review', college: 'College', this_week: 'Deal of Week',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold text-white">Deals</h1>
        <span className="text-vault-textSecondary text-sm">{deals.length} shown</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-textHint w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or business…"
            className="w-full bg-vault-card border border-vault-border rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-vault-textHint focus:outline-none focus:ring-2 focus:ring-vault-primary text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(filterLabels) as StatusFilter[]).map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${statusFilter === f ? 'bg-vault-primary text-white' : 'bg-vault-card border border-vault-border text-vault-textSecondary hover:text-white'}`}>
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-vault-card rounded-2xl border border-vault-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-vault-surface text-vault-textSecondary">
              <tr>
                <th className="text-left px-4 py-3">Deal</th>
                <th className="text-left px-4 py-3">Business</th>
                <th className="text-left px-4 py-3">Discount</th>
                <th className="text-left px-4 py-3">Redemptions</th>
                <th className="text-left px-4 py-3">Expires</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vault-border">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-vault-elevated rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : deals.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-vault-textSecondary">No deals found</td></tr>
              ) : deals.map((d) => (
                <tr key={d.id} className="hover:bg-vault-elevated/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {d.is_deal_of_week && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />}
                      {d.is_college_deal && <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      <span className="font-medium text-white line-clamp-1">{d.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-vault-textSecondary">
                    <div>
                      <p>{d.business_name}</p>
                      <p className="text-xs text-vault-textHint">{d.business_city}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                      {d.discount_percentage}% OFF
                    </span>
                  </td>
                  <td className="px-4 py-3 text-vault-textSecondary">{d.redemption_count}</td>
                  <td className="px-4 py-3 text-vault-textSecondary">{formatDate(d.end_date)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.is_active ? 'bg-green-500/20 text-green-400' : 'bg-vault-elevated text-vault-textSecondary'}`}>
                      {d.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => toggleDealOfWeek(d.id, d.is_deal_of_week)}
                        className={`p-1.5 rounded-lg transition-colors ${d.is_deal_of_week ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-vault-elevated text-vault-textHint hover:text-white'}`}
                        title="Toggle Deal of the Week">
                        <Star className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleCollegeDeal(d.id, d.is_college_deal)}
                        className={`p-1.5 rounded-lg transition-colors ${d.is_college_deal ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-vault-elevated text-vault-textHint hover:text-white'}`}
                        title="Toggle College Deal">
                        <GraduationCap className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleActive(d.id, d.is_active)}
                        className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${d.is_active ? 'bg-vault-elevated text-vault-textSecondary hover:text-white' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>
                        {d.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => deleteDeal(d.id)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
