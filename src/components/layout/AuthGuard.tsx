'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { canAccessPortal, getPortalForRole, type PortalKey } from '@/lib/portals';

type AuthGuardProps = {
  portal: PortalKey;
  children: React.ReactNode;
};

export default function AuthGuard({ portal, children }: AuthGuardProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_banned')
        .eq('id', session.user.id)
        .single();

      if (profile?.is_banned) {
        await supabase.auth.signOut();
        window.location.replace('/login');
        return;
      }

      const role = profile?.role;
      if (!canAccessPortal(role, portal)) {
        window.location.replace(getPortalForRole(role).homePath);
        return;
      }

      setReady(true);
    });
  }, [portal]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-vault-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-vault-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
