import {
  BarChart2,
  Bell,
  BookOpen,
  Building2,
  CreditCard,
  Gift,
  GitBranch,
  LayoutDashboard,
  Layers,
  MapPin,
  Megaphone,
  MessageSquare,
  QrCode,
  Settings,
  Tag,
  Trophy,
  Users,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

export type ProfileRole = 'user' | 'business' | 'ambassador' | 'admin' | 'super_admin';
export type PortalKey = 'admin' | 'business' | 'user' | 'ambassador';

export type PortalNavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

type PortalConfig = {
  key: PortalKey;
  role: Exclude<ProfileRole, 'super_admin'>;
  title: string;
  subtitle: string;
  homePath: string;
  roleLabel: string;
  nav: PortalNavItem[];
};

export const portalConfigs: Record<PortalKey, PortalConfig> = {
  admin: {
    key: 'admin',
    role: 'admin',
    title: 'Vault Admin',
    subtitle: 'Management Panel',
    homePath: '/admin/dashboard',
    roleLabel: 'Administrator',
    nav: [
      { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/admin/users', icon: Users, label: 'Users' },
      { href: '/admin/businesses', icon: Building2, label: 'Businesses' },
      { href: '/admin/deals', icon: Tag, label: 'Deals' },
      { href: '/admin/bookings', icon: BookOpen, label: 'Bookings' },
      { href: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
      { href: '/admin/referrals', icon: GitBranch, label: 'Referrals' },
      { href: '/admin/content', icon: Layers, label: 'Content' },
      { href: '/admin/locations', icon: MapPin, label: 'Locations' },
      { href: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
      { href: '/admin/notifications', icon: Bell, label: 'Notifications' },
      { href: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
    ],
  },
  business: {
    key: 'business',
    role: 'business',
    title: 'Vault Business',
    subtitle: 'Partner Portal',
    homePath: '/business/dashboard',
    roleLabel: 'Business Partner',
    nav: [
      { href: '/business/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/business/profile', icon: Building2, label: 'Business Profile' },
      { href: '/business/deals', icon: Tag, label: 'Deals' },
      { href: '/business/bookings', icon: BookOpen, label: 'Bookings' },
      { href: '/business/redemptions', icon: QrCode, label: 'Redemptions' },
      { href: '/business/analytics', icon: BarChart2, label: 'Analytics' },
      { href: '/business/billing', icon: CreditCard, label: 'Billing' },
    ],
  },
  user: {
    key: 'user',
    role: 'user',
    title: 'Vault Member',
    subtitle: 'Member Portal',
    homePath: '/user/dashboard',
    roleLabel: 'Member',
    nav: [
      { href: '/user/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/user/membership', icon: CreditCard, label: 'Membership' },
      { href: '/user/bookings', icon: BookOpen, label: 'Bookings' },
      { href: '/user/wallet', icon: WalletCards, label: 'Wallet' },
      { href: '/user/referrals', icon: GitBranch, label: 'Referrals' },
      { href: '/user/notifications', icon: Bell, label: 'Notifications' },
      { href: '/user/settings', icon: Settings, label: 'Settings' },
    ],
  },
  ambassador: {
    key: 'ambassador',
    role: 'ambassador',
    title: 'Vault Ambassador',
    subtitle: 'Growth Portal',
    homePath: '/ambassador/dashboard',
    roleLabel: 'Ambassador',
    nav: [
      { href: '/ambassador/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/ambassador/campaigns', icon: Megaphone, label: 'Campaigns' },
      { href: '/ambassador/referrals', icon: GitBranch, label: 'Referrals' },
      { href: '/ambassador/rewards', icon: Gift, label: 'Rewards' },
      { href: '/ambassador/payouts', icon: WalletCards, label: 'Payouts' },
      { href: '/ambassador/leaderboard', icon: Trophy, label: 'Leaderboard' },
    ],
  },
};

export const portalSwitcherOptions: { key: PortalKey; label: string }[] = [
  { key: 'admin', label: 'Admin' },
  { key: 'business', label: 'Business' },
  { key: 'user', label: 'Member' },
  { key: 'ambassador', label: 'Ambassador' },
];

export function isSuperAdmin(role?: string | null): boolean {
  return role === 'super_admin';
}

export function canAccessPortal(profileRole?: string | null, portal?: PortalKey): boolean {
  if (!portal) return false;
  if (isSuperAdmin(profileRole)) return true;
  return profileRole === portal;
}

export function getPortalForRole(role?: string | null): PortalConfig {
  if (role === 'admin' || role === 'super_admin') return portalConfigs.admin;
  if (role === 'business') return portalConfigs.business;
  if (role === 'ambassador') return portalConfigs.ambassador;
  return portalConfigs.user;
}

export function isPortalKey(value: string): value is PortalKey {
  return value === 'admin' || value === 'business' || value === 'user' || value === 'ambassador';
}
