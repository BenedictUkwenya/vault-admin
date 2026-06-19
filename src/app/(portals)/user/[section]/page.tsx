import PortalPlaceholder from '@/components/portal/PortalPlaceholder';

const sections: Record<string, { title: string; description: string; items: string[] }> = {
  dashboard: {
    title: 'Member Dashboard',
    description: 'A self-service home for members to manage their Vault account, membership, savings, bookings, and referrals.',
    items: ['Membership status', 'Recommended deals', 'Upcoming bookings', 'Savings summary', 'Unread notifications'],
  },
  membership: {
    title: 'Membership',
    description: 'Membership card, plan status, billing access, and upgrade/cancel workflows.',
    items: ['Digital card', 'Plan status', 'Upgrade flow', 'Billing portal', 'Membership QR'],
  },
  bookings: {
    title: 'My Bookings',
    description: 'Member booking history with detail, cancellation, and status tracking.',
    items: ['Upcoming bookings', 'Past bookings', 'Cancel booking', 'Business responses', 'Booking detail'],
  },
  wallet: {
    title: 'Wallet',
    description: 'Savings, redemption history, and member value tracking.',
    items: ['Savings total', 'Redemption history', 'Favorite businesses', 'Recent activity'],
  },
  referrals: {
    title: 'Referrals',
    description: 'Invite friends, track referral progress, and see rewards earned through sharing Vault.',
    items: ['Referral link', 'Invite code', 'Progress tracker', 'Reward history', 'Share actions'],
  },
  notifications: {
    title: 'Notifications',
    description: 'Member inbox for booking, membership, referral, payment, and system updates.',
    items: ['Unread updates', 'Booking alerts', 'Membership notices', 'Mark as read'],
  },
  settings: {
    title: 'Settings',
    description: 'Profile, contact preferences, security, and account controls.',
    items: ['Profile details', 'Password update', 'Notification preferences', 'Account deletion'],
  },
};

export default function UserSectionPage({ params }: { params: { section: string } }) {
  const section = sections[params.section] ?? sections.dashboard;

  return <PortalPlaceholder {...section} />;
}
