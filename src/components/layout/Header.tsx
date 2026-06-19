'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { LogOut } from 'lucide-react';
import { isSuperAdmin, portalConfigs, type PortalKey } from '@/lib/portals';
import PortalSwitcher from '@/components/layout/PortalSwitcher';

type HeaderProps = {
  portal?: PortalKey;
};

export default function Header({ portal = 'admin' }: HeaderProps) {
  const [user, setUser] = useState<{
    email: string;
    fullName?: string;
    avatarUrl?: string;
    role?: string;
  } | null>(null);
  const supabase = createClient();
  const config = portalConfigs[portal];

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role')
        .eq('id', session.user.id)
        .single();
      setUser({
        email: session.user.email!,
        fullName: profile?.full_name,
        avatarUrl: profile?.avatar_url,
        role: profile?.role,
      });
    });
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.replace('/login');
  }

  if (!user) return <header className="h-14 shrink-0 bg-vault-surface border-b border-vault-border" />;

  const roleLabel = isSuperAdmin(user.role) ? 'Super Admin' : config.roleLabel;

  return (
    <header className="h-14 shrink-0 bg-vault-surface border-b border-vault-border flex items-center justify-between px-6 overflow-visible">
      <div className="flex items-center gap-3 min-w-0">
        {isSuperAdmin(user.role) && <PortalSwitcher currentPortal={portal} />}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-white">{user.fullName || user.email}</p>
          <p className="text-xs text-vault-textHint">{roleLabel}</p>
        </div>
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-gradient flex items-center justify-center text-white text-xs font-bold">
            {(user.fullName || user.email)[0].toUpperCase()}
          </div>
        )}
        <button
          onClick={signOut}
          className="p-2 rounded-xl text-vault-textSecondary hover:text-white hover:bg-vault-elevated transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
