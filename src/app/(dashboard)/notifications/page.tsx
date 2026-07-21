'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { adminApi } from '@/lib/api-client';
import { Send, Users, Crown, Building2 } from 'lucide-react';

type Segment = 'all' | 'paid' | 'free' | 'business';

const segments: { value: Segment; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Users', description: 'Every registered user', icon: Users },
  { value: 'paid', label: 'Paid Members', description: 'Users with paid membership', icon: Crown },
  { value: 'free', label: 'Free Members', description: 'Users on free tier', icon: Users },
  { value: 'business', label: 'Business Owners', description: 'Users with business role', icon: Building2 },
];

export default function NotificationsPage() {
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState<Segment>('all');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult('');

    let query = supabase.from('profiles').select('id');
    if (segment === 'paid') query = query.eq('membership_tier', 'paid');
    if (segment === 'free') query = query.eq('membership_tier', 'free');
    if (segment === 'business') query = query.eq('role', 'business');

    const { data: users } = await query;
    if (users && users.length > 0) {
      try {
        await adminApi.broadcastNotification({
          title,
          body,
          type: 'system',
          user_ids: users.map((u) => u.id),
        } as { title: string; body: string; type?: string; user_ids?: string[] });
      } catch {
        const rows = users.map((u) => ({ user_id: u.id, title, body, type: 'system' as const }));
        for (let i = 0; i < rows.length; i += 500) {
          await supabase.from('notifications').insert(rows.slice(i, i + 500));
        }
      }
      setResult(`✅ Sent to ${users.length} ${segment === 'all' ? 'users' : segment + ' users'}`);
    } else {
      setResult('⚠️ No users matched the selected segment');
    }

    setTitle('');
    setBody('');
    setSending(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-display font-bold text-white">Notifications</h1>

      <div className="bg-vault-card rounded-2xl border border-vault-border p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Send Notification</h2>

        {/* Segment selector */}
        <div>
          <p className="text-sm font-medium text-vault-textSecondary mb-3">Target Audience</p>
          <div className="grid grid-cols-2 gap-2">
            {segments.map(({ value, label, description, icon: Icon }) => (
              <button key={value} type="button" onClick={() => setSegment(value)}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${segment === value ? 'border-vault-primary bg-vault-primary/10' : 'border-vault-border bg-vault-surface hover:border-vault-primary/50'}`}>
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${segment === value ? 'text-vault-primary' : 'text-vault-textSecondary'}`} />
                <div>
                  <p className={`text-sm font-medium ${segment === value ? 'text-white' : 'text-vault-textSecondary'}`}>{label}</p>
                  <p className="text-xs text-vault-textHint">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-vault-textSecondary mb-1.5">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full bg-vault-surface border border-vault-border rounded-xl px-4 py-3 text-white placeholder-vault-textHint focus:outline-none focus:ring-2 focus:ring-vault-primary"
              placeholder="Notification title…" />
          </div>
          <div>
            <label className="block text-sm font-medium text-vault-textSecondary mb-1.5">Message</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={4}
              className="w-full bg-vault-surface border border-vault-border rounded-xl px-4 py-3 text-white placeholder-vault-textHint focus:outline-none focus:ring-2 focus:ring-vault-primary resize-none"
              placeholder="Write your message…" />
          </div>

          {result && <p className={`text-sm ${result.startsWith('✅') ? 'text-green-400' : 'text-yellow-400'}`}>{result}</p>}

          <button type="submit" disabled={sending}
            className="flex items-center gap-2 bg-primary-gradient text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
            <Send className="w-4 h-4" />
            {sending ? 'Sending…' : `Send to ${segments.find(s => s.value === segment)?.label}`}
          </button>
        </form>
      </div>
    </div>
  );
}
