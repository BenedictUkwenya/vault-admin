import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface Business {
  id: string;
  name: string;
  city: string;
  logo_url: string;
  created_at: string;
}

export default function RecentBusinesses({ businesses }: { businesses: Business[] }) {
  return (
    <div className="bg-vault-card rounded-2xl border border-vault-border p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-white">Pending Approval</h3>
        <Link href="/businesses" className="text-vault-primary text-xs hover:underline">View all</Link>
      </div>

      {businesses.length === 0 ? (
        <p className="text-vault-textHint text-sm">No pending businesses.</p>
      ) : (
        <ul className="space-y-3">
          {businesses.map((b) => (
            <li key={b.id} className="flex items-center gap-3">
              {b.logo_url ? (
                <img src={b.logo_url} alt={b.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-vault-elevated flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-vault-textHint" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-white text-sm truncate">{b.name}</p>
                <p className="text-vault-textHint text-xs">{b.city} · {formatDate(b.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
