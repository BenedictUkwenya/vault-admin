'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { Search, Crown, UserCog, X } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  membership_tier: string;
  membership_expires_at: string | null;
  referral_count: number;
  referral_code: string;
  total_savings: number;
  streak_count: number;
  is_banned: boolean;
  created_at: string;
}

type RoleFilter = 'all' | 'user' | 'business' | 'admin';
type TierFilter = 'all' | 'free' | 'paid';

export default function UsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => { fetchUsers(); }, [search, roleFilter, tierFilter]);

  async function fetchUsers() {
    setLoading(true);
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200);
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    if (roleFilter !== 'all') query = query.eq('role', roleFilter);
    if (tierFilter !== 'all') query = query.eq('membership_tier', tierFilter);
    const { data } = await query;
    setUsers(data ?? []);
    setLoading(false);
  }

  async function toggleBan(userId: string, banned: boolean) {
    await supabase.from('profiles').update({ is_banned: !banned }).eq('id', userId);
    fetchUsers();
  }

  async function upgradeTier(userId: string, current: string) {
    const newTier = current === 'paid' ? 'free' : 'paid';
    const expires = newTier === 'paid' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
    await supabase.from('profiles').update({ membership_tier: newTier, membership_expires_at: expires }).eq('id', userId);
    fetchUsers();
    if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, membership_tier: newTier } : null);
  }

  async function changeRole(userId: string, newRole: string) {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    fetchUsers();
    if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold text-white">Users</h1>
        <span className="text-vault-textSecondary text-sm">{users.length} shown</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-textHint w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-vault-card border border-vault-border rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-vault-textHint focus:outline-none focus:ring-2 focus:ring-vault-primary text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'user', 'business', 'admin'] as RoleFilter[]).map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${roleFilter === r ? 'bg-vault-primary text-white' : 'bg-vault-card border border-vault-border text-vault-textSecondary hover:text-white'}`}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'free', 'paid'] as TierFilter[]).map((t) => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${tierFilter === t ? 'bg-yellow-500 text-black' : 'bg-vault-card border border-vault-border text-vault-textSecondary hover:text-white'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-vault-card rounded-2xl border border-vault-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-vault-surface text-vault-textSecondary">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Membership</th>
                <th className="text-left px-4 py-3">Referrals</th>
                <th className="text-left px-4 py-3">Savings</th>
                <th className="text-left px-4 py-3">Joined</th>
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
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-vault-textSecondary">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-vault-elevated/40 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedUser(u)} className="text-left">
                      <p className="font-medium text-white hover:text-vault-primary transition-colors">{u.full_name || '—'}</p>
                      <p className="text-vault-textHint text-xs">{u.email}</p>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                      u.role === 'business' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-vault-elevated text-vault-textSecondary'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.membership_tier === 'paid' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-vault-elevated text-vault-textSecondary'}`}>
                      {u.membership_tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-vault-textSecondary">{u.referral_count}</td>
                  <td className="px-4 py-3 text-vault-textSecondary">${u.total_savings?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-vault-textSecondary">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => upgradeTier(u.id, u.membership_tier)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
                          u.membership_tier === 'paid' ? 'bg-vault-elevated text-vault-textSecondary hover:text-white' : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'}`}
                        title={u.membership_tier === 'paid' ? 'Downgrade to free' : 'Upgrade to paid'}>
                        <Crown className="w-3 h-3" />
                        {u.membership_tier === 'paid' ? 'Downgrade' : 'Upgrade'}
                      </button>
                      <button onClick={() => toggleBan(u.id, u.is_banned)}
                        className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
                          u.is_banned ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}>
                        {u.is_banned ? 'Unban' : 'Ban'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User detail drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-md bg-vault-surface border-l border-vault-border h-full overflow-y-auto p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-white">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-vault-textSecondary hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                ['Name', selectedUser.full_name || '—'],
                ['Email', selectedUser.email],
                ['Role', selectedUser.role],
                ['Membership', selectedUser.membership_tier],
                ['Expires', selectedUser.membership_expires_at ? formatDate(selectedUser.membership_expires_at) : '—'],
                ['Referral Code', selectedUser.referral_code || '—'],
                ['Referral Count', String(selectedUser.referral_count)],
                ['Total Savings', `$${selectedUser.total_savings?.toFixed(2)}`],
                ['Streak', String(selectedUser.streak_count)],
                ['Banned', selectedUser.is_banned ? 'Yes' : 'No'],
                ['Joined', formatDate(selectedUser.created_at)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-vault-border/50">
                  <span className="text-vault-textSecondary text-sm">{label}</span>
                  <span className="text-white text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-2">
              <p className="text-vault-textSecondary text-xs font-medium uppercase tracking-wider">Change Role</p>
              <div className="flex gap-2 flex-wrap">
                {(['user', 'business', 'admin'] as const).map((r) => (
                  <button key={r} onClick={() => changeRole(selectedUser.id, r)}
                    disabled={selectedUser.role === r}
                    className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl font-medium transition-colors ${
                      selectedUser.role === r ? 'bg-vault-primary text-white' : 'bg-vault-elevated text-vault-textSecondary hover:text-white'}`}>
                    <UserCog className="w-3.5 h-3.5" />
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
              <button onClick={() => { upgradeTier(selectedUser.id, selectedUser.membership_tier); }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  selectedUser.membership_tier === 'paid' ? 'bg-vault-elevated text-vault-textSecondary hover:text-white' : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'}`}>
                <Crown className="w-4 h-4" />
                {selectedUser.membership_tier === 'paid' ? 'Downgrade to Free' : 'Upgrade to Paid (30 days)'}
              </button>
              <button onClick={() => toggleBan(selectedUser.id, selectedUser.is_banned)}
                className={`w-full py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  selectedUser.is_banned ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}>
                {selectedUser.is_banned ? 'Unban User' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
