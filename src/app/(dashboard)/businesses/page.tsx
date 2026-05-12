'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, Building2, BadgeCheck, X, ExternalLink } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  website_url: string;
  city: string;
  state: string;
  address: string;
  category_name: string;
  logo_url: string;
  cover_image_url: string;
  is_approved: boolean;
  is_verified: boolean;
  total_deals_count: number;
  active_deals_count: number;
  total_views: number;
  average_rating: number;
  created_at: string;
}

export default function BusinessesPage() {
  const supabase = createClient();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Business | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchBusinesses(); }, [filter]);

  async function fetchBusinesses() {
    setLoading(true);
    let query = supabase.from('businesses_with_stats').select('*').order('created_at', { ascending: false }).limit(200);
    if (filter === 'pending') query = query.eq('is_approved', false);
    if (filter === 'approved') query = query.eq('is_approved', true);
    const { data } = await query;
    setBusinesses(data ?? []);
    setLoading(false);
  }

  async function approve(id: string) {
    await supabase.from('businesses').update({ is_approved: true }).eq('id', id);
    fetchBusinesses();
    if (selectedBusiness?.id === id) setSelectedBusiness(prev => prev ? { ...prev, is_approved: true } : null);
  }

  async function confirmReject() {
    if (!rejectTarget) return;
    await supabase.from('businesses').update({ is_approved: false, rejection_reason: rejectReason }).eq('id', rejectTarget.id);
    setRejectTarget(null);
    setRejectReason('');
    fetchBusinesses();
    if (selectedBusiness?.id === rejectTarget.id) setSelectedBusiness(prev => prev ? { ...prev, is_approved: false } : null);
  }

  async function toggleVerified(id: string, current: boolean) {
    await supabase.from('businesses').update({ is_verified: !current }).eq('id', id);
    fetchBusinesses();
    if (selectedBusiness?.id === id) setSelectedBusiness(prev => prev ? { ...prev, is_verified: !current } : null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold text-white">Businesses</h1>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f ? 'bg-vault-primary text-white' : 'bg-vault-card border border-vault-border text-vault-textSecondary hover:text-white'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-vault-card rounded-2xl border border-vault-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-vault-surface text-vault-textSecondary">
              <tr>
                <th className="text-left px-4 py-3">Business</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Deals</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Submitted</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vault-border">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-vault-elevated rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : businesses.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-vault-textSecondary">No businesses found</td></tr>
              ) : businesses.map((b) => (
                <tr key={b.id} className="hover:bg-vault-elevated/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {b.logo_url ? (
                        <img src={b.logo_url} alt={b.name} className="w-9 h-9 rounded-lg object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-vault-elevated flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-vault-textHint" />
                        </div>
                      )}
                      <div>
                        <button onClick={() => setSelectedBusiness(b)} className="font-medium text-white hover:text-vault-primary transition-colors flex items-center gap-1">
                          {b.name}
                          {b.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-vault-primary" />}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-vault-textSecondary">{b.category_name || '—'}</td>
                  <td className="px-4 py-3 text-vault-textSecondary">{b.city}{b.state ? `, ${b.state}` : ''}</td>
                  <td className="px-4 py-3 text-vault-textSecondary">{b.active_deals_count}/{b.total_deals_count}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {b.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-vault-textSecondary">{formatDate(b.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {!b.is_approved && (
                        <button onClick={() => approve(b.id)} className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => setRejectTarget(b)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors" title="Reject">
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleVerified(b.id, b.is_verified)}
                        className={`p-1.5 rounded-lg transition-colors ${b.is_verified ? 'bg-vault-primary/20 text-vault-primary hover:bg-vault-primary/30' : 'bg-vault-elevated text-vault-textHint hover:text-white'}`}
                        title={b.is_verified ? 'Remove verified badge' : 'Mark as verified'}>
                        <BadgeCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Business detail drawer */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setSelectedBusiness(null)}>
          <div className="w-full max-w-md bg-vault-surface border-l border-vault-border h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {selectedBusiness.cover_image_url && (
              <img src={selectedBusiness.cover_image_url} alt="Cover" className="w-full h-36 object-cover" />
            )}
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {selectedBusiness.logo_url ? (
                    <img src={selectedBusiness.logo_url} alt={selectedBusiness.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-vault-elevated flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-vault-textHint" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-display font-bold text-white flex items-center gap-1">
                      {selectedBusiness.name}
                      {selectedBusiness.is_verified && <BadgeCheck className="w-4 h-4 text-vault-primary" />}
                    </h2>
                    <p className="text-vault-textSecondary text-sm">{selectedBusiness.category_name}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedBusiness(null)} className="text-vault-textSecondary hover:text-white mt-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {selectedBusiness.description && (
                <p className="text-vault-textSecondary text-sm">{selectedBusiness.description}</p>
              )}
              <div className="space-y-2">
                {[
                  ['Location', `${selectedBusiness.address || ''} ${selectedBusiness.city}, ${selectedBusiness.state}`.trim()],
                  ['Email', selectedBusiness.email],
                  ['Phone', selectedBusiness.phone],
                  ['Website', selectedBusiness.website_url],
                  ['Active Deals', String(selectedBusiness.active_deals_count)],
                  ['Total Views', String(selectedBusiness.total_views)],
                  ['Rating', selectedBusiness.average_rating ? `${Number(selectedBusiness.average_rating).toFixed(1)} ★` : '—'],
                  ['Joined', formatDate(selectedBusiness.created_at)],
                ].map(([label, value]) => value && value !== ' ,' && (
                  <div key={label} className="flex justify-between py-2 border-b border-vault-border/50">
                    <span className="text-vault-textSecondary text-sm">{label}</span>
                    <span className="text-white text-sm font-medium max-w-[200px] text-right truncate">
                      {label === 'Website' && value ? (
                        <a href={value} target="_blank" rel="noopener noreferrer" className="text-vault-primary flex items-center gap-1 justify-end">
                          {value.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 pt-2">
                {!selectedBusiness.is_approved && (
                  <button onClick={() => { approve(selectedBusiness.id); }}
                    className="w-full py-2.5 rounded-xl font-medium text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                    Approve Business
                  </button>
                )}
                <button onClick={() => { setRejectTarget(selectedBusiness); setSelectedBusiness(null); }}
                  className="w-full py-2.5 rounded-xl font-medium text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                  Reject Business
                </button>
                <button onClick={() => toggleVerified(selectedBusiness.id, selectedBusiness.is_verified)}
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition-colors ${selectedBusiness.is_verified ? 'bg-vault-primary/20 text-vault-primary hover:bg-vault-primary/30' : 'bg-vault-elevated text-vault-textSecondary hover:text-white'}`}>
                  {selectedBusiness.is_verified ? 'Remove Verified Badge' : 'Grant Verified Badge'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-vault-surface border border-vault-border rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-display font-bold text-white">Reject Business</h3>
            <p className="text-vault-textSecondary text-sm">Rejecting <strong className="text-white">{rejectTarget.name}</strong>. Provide a reason (optional):</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Incomplete information, duplicate listing…"
              className="w-full bg-vault-card border border-vault-border rounded-xl px-4 py-3 text-white placeholder-vault-textHint focus:outline-none focus:ring-2 focus:ring-vault-primary text-sm resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectTarget(null); setRejectReason(''); }}
                className="flex-1 py-2.5 rounded-xl border border-vault-border text-vault-textSecondary hover:text-white text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={confirmReject}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-colors">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
