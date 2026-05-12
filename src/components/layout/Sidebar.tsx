'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, Tag, CreditCard, BarChart2, Bell,
  BookOpen, GitBranch, MessageSquare, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/users',          icon: Users,            label: 'Users' },
  { href: '/businesses',     icon: Building2,        label: 'Businesses' },
  { href: '/deals',          icon: Tag,              label: 'Deals' },
  { href: '/bookings',       icon: BookOpen,         label: 'Bookings' },
  { href: '/subscriptions',  icon: CreditCard,       label: 'Subscriptions' },
  { href: '/referrals',      icon: GitBranch,        label: 'Referrals' },
  { href: '/content',        icon: Layers,           label: 'Content' },
  { href: '/analytics',      icon: BarChart2,        label: 'Analytics' },
  { href: '/notifications',  icon: Bell,             label: 'Notifications' },
  { href: '/feedback',       icon: MessageSquare,    label: 'Feedback' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-vault-surface border-r border-vault-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-vault-border">
        <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center shrink-0">
          <span className="text-white font-display font-bold text-sm">V</span>
        </div>
        <div>
          <p className="font-display font-bold text-white text-sm">Vault Admin</p>
          <p className="text-vault-textHint text-xs">Management Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
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
