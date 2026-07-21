import { AmbassadorSection } from '@/components/portal/AmbassadorSection';

export default function AmbassadorSectionPage({ params }: { params: { section: string } }) {
  return <AmbassadorSection section={params.section} />;
}
