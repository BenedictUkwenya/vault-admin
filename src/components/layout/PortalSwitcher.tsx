'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Building2,
  ChevronDown,
  LayoutDashboard,
  Megaphone,
  Users,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import { portalConfigs, portalSwitcherOptions, type PortalKey } from '@/lib/portals';

const portalIcons: Record<PortalKey, typeof LayoutDashboard> = {
  admin: LayoutDashboard,
  business: Building2,
  user: Users,
  ambassador: Megaphone,
};

type PortalSwitcherProps = {
  currentPortal: PortalKey;
};

export default function PortalSwitcher({ currentPortal }: PortalSwitcherProps) {
  const [open, setOpen] = useState(false);
  const current = portalConfigs[currentPortal];

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-2.5 pl-3 pr-2.5 py-2 rounded-xl text-sm font-medium transition-colors',
            'bg-vault-elevated border border-vault-border text-white',
            'hover:border-vault-primary/40 hover:bg-vault-card',
            'focus:outline-none focus:ring-2 focus:ring-vault-primary/40',
            open && 'border-vault-primary/50 bg-vault-card'
          )}
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-vault-primary/15 text-vault-primary">
            <LayoutDashboard className="w-3.5 h-3.5" />
          </span>
          <span className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-[10px] uppercase tracking-wider text-vault-textHint font-medium">
              Viewing
            </span>
            <span className="text-white">{current.title.replace('Vault ', '')}</span>
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-vault-textSecondary transition-transform ml-1',
              open && 'rotate-180'
            )}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-[100] min-w-[240px] rounded-2xl border border-vault-border bg-vault-surface p-2 shadow-2xl"
        >
          <DropdownMenu.Label className="px-3 py-2 text-[10px] uppercase tracking-wider text-vault-textHint font-semibold">
            Switch portal
          </DropdownMenu.Label>

          {portalSwitcherOptions.map(({ key, label }) => {
            const active = currentPortal === key;
            const config = portalConfigs[key];
            const Icon = portalIcons[key];

            return (
              <DropdownMenu.Item key={key} asChild>
                <Link
                  href={config.homePath}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer outline-none transition-colors',
                    active
                      ? 'bg-vault-primary/15 text-white'
                      : 'text-vault-textSecondary hover:bg-vault-elevated hover:text-white'
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center w-9 h-9 rounded-xl shrink-0',
                      active ? 'bg-vault-primary/20 text-vault-primary' : 'bg-vault-elevated text-vault-textSecondary'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-[11px] text-vault-textHint truncate">
                      {config.subtitle}
                    </span>
                  </span>
                  {active && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-vault-primary shrink-0">
                      Active
                    </span>
                  )}
                </Link>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
