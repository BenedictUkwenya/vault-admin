import PortalShell from '@/components/layout/PortalShell';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell portal="user">{children}</PortalShell>;
}
