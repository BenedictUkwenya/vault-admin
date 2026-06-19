import PortalPlaceholder from '@/components/portal/PortalPlaceholder';

const sections: Record<string, { title: string; description: string; items: string[] }> = {
  dashboard: {
    title: 'Ambassador Dashboard',
    description: 'A growth workspace for ambassadors to track campaigns, conversions, rewards, and payout readiness.',
    items: ['Referral funnel', 'Conversion summary', 'Reward balance', 'Campaign tasks', 'Payout status'],
  },
  campaigns: {
    title: 'Campaigns',
    description: 'Shareable campaigns, creative assets, invite links, and performance goals.',
    items: ['Active campaigns', 'Share assets', 'Tracking links', 'Campaign goals', 'Content guidelines'],
  },
  referrals: {
    title: 'Referral Performance',
    description: 'Detailed attribution for signups, paid conversions, pending referrals, and completed rewards.',
    items: ['Invite code', 'Signup tracking', 'Paid conversions', 'Pending referrals', 'Export list'],
  },
  rewards: {
    title: 'Rewards',
    description: 'Reward ledger and earning rules for ambassador-driven growth.',
    items: ['Reward balance', 'Ledger entries', 'Pending rewards', 'Completed rewards', 'Adjustment notes'],
  },
  payouts: {
    title: 'Payouts',
    description: 'Payout setup, payout status, and historical payment records.',
    items: ['Payout method', 'Pending payout', 'Paid history', 'Tax details', 'Support request'],
  },
  leaderboard: {
    title: 'Leaderboard',
    description: 'Optional ranking and motivation layer for top ambassadors and campaign performers.',
    items: ['Top ambassadors', 'Monthly rankings', 'Campaign winners', 'Milestones', 'Badges'],
  },
};

export default function AmbassadorSectionPage({ params }: { params: { section: string } }) {
  const section = sections[params.section] ?? sections.dashboard;

  return <PortalPlaceholder {...section} />;
}
