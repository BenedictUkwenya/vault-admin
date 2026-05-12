'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
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
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        window.location.replace('/login');
        return;
      }

      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-vault-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-vault-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
