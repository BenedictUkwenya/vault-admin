'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { portalConfigs, type PortalKey } from '@/lib/portals';

type SidebarProps = {
  portal?: PortalKey;
};

export default function Sidebar({ portal = 'admin' }: SidebarProps) {
  const pathname = usePathname();
  const config = portalConfigs[portal];

  return (
    <aside className="w-60 shrink-0 bg-vault-surface border-r border-vault-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-vault-border">
        <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center shrink-0">
          <span className="text-white font-display font-bold text-sm">V</span>
        </div>
        <div>
          <p className="font-display font-bold text-white text-sm">{config.title}</p>
          <p className="text-vault-textHint text-xs">{config.subtitle}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {config.nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== config.homePath && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-vault-primary/15 text-vault-primary'
                  : 'text-vault-textSecondary hover:text-white hover:bg-vault-elevated'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-vault-border">
        <p className="text-vault-textHint text-xs">Vault © 2024</p>
      </div>
    </aside>
  );
}
