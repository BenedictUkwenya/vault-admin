'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Star, Trash2, MailCheck } from 'lucide-react';

interface Feedback {
  id: string;
  user_id: string | null;
  rating: number | null;
  category: string | null;
  message: string;
  created_at: string;
  user?: { full_name: string; email: string } | null;
}

interface WaitlistEntry {
  id: string;
  email: string;
  city: string | null;
  created_at: string;
}

type Tab = 'feedback' | 'waitlist';

export default function FeedbackPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>('feedback');
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [loadingWaitlist, setLoadingWaitlist] = useState(true);

  useEffect(() => {
    fetchFeedback();
    fetchWaitlist();
  }, []);

  async function fetchFeedback() {
    setLoadingFeedback(true);
    const { data } = await supabase
      .from('feedback')
      .select('*, user:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(100);
    setFeedback(data ?? []);
    setLoadingFeedback(false);
  }

  async function fetchWaitlist() {
    setLoadingWaitlist(true);
    const { data } = await supabase.from('waitlist').select('*').order('created_at', { ascending: false }).limit(200);
    setWaitlist(data ?? []);
    setLoadingWaitlist(false);
  }

  async function deleteFeedback(id: string) {
    await supabase.from('feedback').delete().eq('id', id);
    setFeedback(prev => prev.filter(f => f.id !== id));
  }

  async function deleteWaitlistEntry(id: string) {
    await supabase.from('waitlist').delete().eq('id', id);
    setWaitlist(prev => prev.filter(w => w.id !== id));
  }

  const avgRating = feedback.length > 0
    ? (feedback.filter(f => f.rating).reduce((sum, f) => sum + (f.rating ?? 0), 0) / feedback.filter(f => f.rating).length).toFixed(1)
    : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold text-white">Feedback & Waitlist</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('feedback')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'feedback' ? 'bg-vault-primary text-white' : 'bg-vault-card border border-vault-border text-vault-textSecondary hover:text-white'}`}>
            <MessageSquare className="w-4 h-4" />
            Feedback ({feedback.length})
          </button>
          <button onClick={() => setTab('waitlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'waitlist' ? 'bg-vault-primary text-white' : 'bg-vault-card border border-vault-border text-vault-textSecondary hover:text-white'}`}>
            <MailCheck className="w-4 h-4" />
            Waitlist ({waitlist.length})
          </button>
        </div>
      </div>

      {tab === 'feedback' && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Responses', value: String(feedback.length) },
              { label: 'Avg Rating', value: avgRating + (avgRating !== '—' ? ' ★' : '') },
              { label: '5 Stars', value: String(feedback.filter(f => f.rating === 5).length) },
              { label: 'With Category', value: String(feedback.filter(f => f.category).length) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-vault-card rounded-2xl border border-vault-border p-4">
                <p className="text-vault-textSecondary text-xs">{label}</p>
                <p className="text-xl font-display font-bold text-white mt-1">{value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {loadingFeedback ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-vault-card rounded-2xl border border-vault-border p-4">
                  <div className="h-4 bg-vault-elevated rounded animate-pulse w-1/3 mb-2" />
                  <div className="h-4 bg-vault-elevated rounded animate-pulse w-full" />
                </div>
              ))
            ) : feedback.length === 0 ? (
              <div className="bg-vault-card rounded-2xl border border-vault-border p-8 text-center">
                <MessageSquare className="w-10 h-10 text-vault-textHint mx-auto mb-3" />
                <p className="text-vault-textSecondary">No feedback yet</p>
              </div>
            ) : feedback.map((f) => {
              const user = Array.isArray(f.user) ? f.user[0] : f.user;
              return (
                <div key={f.id} className="bg-vault-card rounded-2xl border border-vault-border p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      {f.rating && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < f.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-vault-elevated'}`} />
                          ))}
                        </div>
                      )}
                      {f.category && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-vault-elevated text-vault-textSecondary">
                          {f.category}
                        </span>
                      )}
                      <span className="text-vault-textHint text-xs">{formatDate(f.created_at)}</span>
                    </div>
                    <button onClick={() => deleteFeedback(f.id)} className="p-1.5 rounded-lg text-vault-textHint hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-white text-sm">{f.message}</p>
                  {user && (
                    <p className="text-vault-textHint text-xs">{user.full_name} · {user.email}</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'waitlist' && (
        <div className="bg-vault-card rounded-2xl border border-vault-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-vault-surface text-vault-textSecondary">
                <tr>
                  <th className="text-left px-4 py-3">#</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">City</th>
                  <th className="text-left px-4 py-3">Signed Up</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vault-border">
                {loadingWaitlist ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-vault-elevated rounded animate-pulse" /></td>
                    ))}</tr>
                  ))
                ) : waitlist.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-vault-textSecondary">No waitlist entries</td></tr>
                ) : waitlist.map((w, idx) => (
                  <tr key={w.id} className="hover:bg-vault-elevated/40 transition-colors">
                    <td className="px-4 py-3 text-vault-textHint">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-white">{w.email}</td>
                    <td className="px-4 py-3 text-vault-textSecondary">{w.city || '—'}</td>
                    <td className="px-4 py-3 text-vault-textSecondary">{formatDate(w.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteWaitlistEntry(w.id)} className="p-1.5 rounded-lg text-vault-textHint hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
