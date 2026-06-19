import AuthGuard from '@/components/layout/AuthGuard';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { type PortalKey } from '@/lib/portals';

type PortalShellProps = {
  portal: PortalKey;
  children: React.ReactNode;
};

export default function PortalShell({ portal, children }: PortalShellProps) {
  return (
    <AuthGuard portal={portal}>
      <div className="flex h-screen bg-vault-bg overflow-hidden">
        <Sidebar portal={portal} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div className="relative z-20 shrink-0 overflow-visible">
            <Header portal={portal} />
          </div>
          <main className="flex-1 overflow-y-auto p-6 bg-vault-bg">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
