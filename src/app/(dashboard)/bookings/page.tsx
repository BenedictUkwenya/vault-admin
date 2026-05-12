'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { Building2, Calendar } from 'lucide-react';

interface Booking {
  id: string;
  user_id: string;
  business_id: string;
  deal_id: string | null;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  notes: string;
  created_at: string;
  user_full_name: string;
  business_name: string;
  business_logo_url: string;
  deal_title: string | null;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'denied' | 'completed' | 'cancelled';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  denied: 'bg-red-500/20 text-red-400',
  completed: 'bg-blue-500/20 text-blue-400',
  cancelled: 'bg-vault-elevated text-vault-textSecondary',
};

export default function BookingsPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => { fetchBookings(); }, [statusFilter]);

  async function fetchBookings() {
    setLoading(true);
    let query = supabase.from('bookings_with_details').select('*').order('created_at', { ascending: false }).limit(200);
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    const { data } = await query;
    setBookings(data ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('bookings').update({ status }).eq('id', id);
    fetchBookings();
  }

  const filters: StatusFilter[] = ['all', 'pending', 'approved', 'denied', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold text-white">Bookings</h1>
        <span className="text-vault-textSecondary text-sm">{bookings.length} shown</span>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${statusFilter === f ? 'bg-vault-primary text-white' : 'bg-vault-card border border-vault-border text-vault-textSecondary hover:text-white'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-vault-card rounded-2xl border border-vault-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-vault-surface text-vault-textSecondary">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Business</th>
                <th className="text-left px-4 py-3">Service / Deal</th>
                <th className="text-left px-4 py-3">Date & Time</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vault-border">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-vault-elevated rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : bookings.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-vault-textSecondary">No bookings found</td></tr>
              ) : bookings.map((b) => (
                <tr key={b.id} className="hover:bg-vault-elevated/40 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{b.user_full_name || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {b.business_logo_url ? (
                        <img src={b.business_logo_url} alt={b.business_name} className="w-6 h-6 rounded object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded bg-vault-elevated flex items-center justify-center">
                          <Building2 className="w-3 h-3 text-vault-textHint" />
                        </div>
                      )}
                      <span className="text-vault-textSecondary">{b.business_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-vault-textSecondary">
                    <div>
                      <p>{b.service_name || '—'}</p>
                      {b.deal_title && <p className="text-xs text-vault-textHint">{b.deal_title}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-vault-textSecondary">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{b.booking_date ? formatDate(b.booking_date) : '—'}</span>
                      {b.booking_time && <span className="text-vault-textHint">{b.booking_time}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] ?? 'bg-vault-elevated text-vault-textSecondary'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b.id, e.target.value)}
                      className="bg-vault-surface border border-vault-border rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-vault-primary"
                    >
                      {['pending', 'approved', 'denied', 'completed', 'cancelled'].map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
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
