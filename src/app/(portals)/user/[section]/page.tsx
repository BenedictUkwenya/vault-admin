import { UserSection } from '@/components/portal/UserSection';

export default function UserSectionPage({ params }: { params: { section: string } }) {
  return <UserSection section={params.section} />;
}
