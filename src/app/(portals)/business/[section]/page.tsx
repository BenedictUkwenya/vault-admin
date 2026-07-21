import { BusinessSection } from '@/components/portal/BusinessSection';

export default function BusinessSectionPage({ params }: { params: { section: string } }) {
  return <BusinessSection section={params.section} />;
}
