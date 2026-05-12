'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = '/dashboard';
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

    if (signInErr) {
      setError(signInErr.message);
      setLoading(false);
      return;
    }

    // Check admin role
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileErr) {
      setError(`Profile lookup failed: ${profileErr.message}`);
      setLoading(false);
      await supabase.auth.signOut();
      return;
    }

    if (profile?.role !== 'admin') {
      setError(`Access denied. Your role is "${profile?.role ?? 'none'}" — admin required.`);
      setLoading(false);
      await supabase.auth.signOut();
      return;
    }

    window.location.href = '/dashboard';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-vault-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-gradient mb-4">
            <span className="text-2xl font-bold font-display text-white">V</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Vault Admin</h1>
          <p className="text-vault-textSecondary mt-1">Sign in to manage your platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-vault-card rounded-2xl p-8 border border-vault-border space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-vault-textSecondary mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-vault-surface border border-vault-border rounded-xl px-4 py-3 text-white placeholder-vault-textHint focus:outline-none focus:ring-2 focus:ring-vault-primary"
              placeholder="admin@getvault.app"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-vault-textSecondary mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-vault-surface border border-vault-border rounded-xl px-4 py-3 text-white placeholder-vault-textHint focus:outline-none focus:ring-2 focus:ring-vault-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-gradient text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
