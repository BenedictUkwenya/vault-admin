import PortalPlaceholder from '@/components/portal/PortalPlaceholder';

const sections: Record<string, { title: string; description: string; items: string[] }> = {
  dashboard: {
    title: 'Business Dashboard',
    description: 'A command center for partners to track bookings, deal performance, redemptions, and account health.',
    items: ['Performance summary', 'Pending bookings', 'Active deals', 'Recent redemptions', 'Approval status', 'Billing alerts'],
  },
  profile: {
    title: 'Business Profile',
    description: 'Self-service management for business details, branding, location, contact information, and approval readiness.',
    items: ['Business details', 'Brand assets', 'Opening information', 'Approval checklist', 'Public preview'],
  },
  deals: {
    title: 'Deal Management',
    description: 'Tools for partners to create, edit, pause, and measure member offers.',
    items: ['Create deal', 'Edit active deals', 'Archive offers', 'Paid-tier gating', 'Deal moderation status'],
  },
  bookings: {
    title: 'Booking Management',
    description: 'Operational workspace for reviewing, approving, denying, and completing booking requests.',
    items: ['Pending requests', 'Approved bookings', 'Calendar view', 'Customer notes', 'Response templates'],
  },
  redemptions: {
    title: 'Redemptions',
    description: 'QR and manual verification workflows for member cards and claimed deals.',
    items: ['Scan QR code', 'Manual lookup', 'Verify redemption', 'Recent scans', 'Member validation'],
  },
  analytics: {
    title: 'Business Analytics',
    description: 'Partner reporting for views, bookings, redemptions, and offer conversion.',
    items: ['Views trend', 'Booking conversion', 'Deal performance', 'Customer savings', 'Export report'],
  },
  billing: {
    title: 'Business Billing',
    description: 'Subscription, invoices, and billing portal access for business partners.',
    items: ['Plan status', 'Payment method', 'Invoices', 'Stripe portal', 'Entitlements'],
  },
};

export default function BusinessSectionPage({ params }: { params: { section: string } }) {
  const section = sections[params.section] ?? sections.dashboard;

  return <PortalPlaceholder {...section} />;
}
