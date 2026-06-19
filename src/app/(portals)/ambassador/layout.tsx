import PortalShell from '@/components/layout/PortalShell';

export default function AmbassadorLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell portal="ambassador">{children}</PortalShell>;
}
