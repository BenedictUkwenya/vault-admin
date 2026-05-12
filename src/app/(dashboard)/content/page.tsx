'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Star, BadgeCheck, Building2, Tag } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  is_deal_of_week: boolean;
  business_name: string;
  discount_percentage: number;
}

interface Business {
  id: string;
  name: string;
  city: string;
  logo_url: string;
  is_verified: boolean;
  is_approved: boolean;
  category_name: string;
}

export default function ContentPage() {
  const supabase = createClient();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [loadingBiz, setLoadingBiz] = useState(true);

  useEffect(() => {
    fetchDeals();
    fetchBusinesses();
  }, []);

  async function fetchDeals() {
    setLoadingDeals(true);
    const { data } = await supabase
      .from('deals_with_business')
      .select('id, title, is_deal_of_week, business_name, discount_percentage')
      .eq('is_active', true)
      .order('business_name')
      .limit(200);
    setDeals(data ?? []);
    setLoadingDeals(false);
  }

  async function fetchBusinesses() {
    setLoadingBiz(true);
    const { data } = await supabase
      .from('businesses_with_stats')
      .select('id, name, city, logo_url, is_verified, is_approved, category_name')
      .eq('is_approved', true)
      .order('name')
      .limit(200);
    setBusinesses(data ?? []);
    setLoadingBiz(false);
  }

  async function toggleDealOfWeek(id: string, current: boolean) {
    await supabase.from('deals').update({ is_deal_of_week: !current }).eq('id', id);
    setDeals(prev => prev.map(d => d.id === id ? { ...d, is_deal_of_week: !current } : d));
  }

  async function toggleVerified(id: string, current: boolean) {
    await supabase.from('businesses').update({ is_verified: !current }).eq('id', id);
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, is_verified: !current } : b));
  }

  const dealsOfWeek = deals.filter(d => d.is_deal_of_week);
  const verifiedBiz = businesses.filter(b => b.is_verified);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">Content Management</h1>
      <p className="text-vault-textSecondary text-sm">Control what appears as featured in the app — deals of the week and verified business badges.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deals of the Week */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Deals of the Week</h2>
            <span className="ml-auto text-vault-textSecondary text-sm">{dealsOfWeek.length} selected</span>
          </div>

          <div className="bg-vault-card rounded-2xl border border-vault-border overflow-hidden max-h-[500px] overflow-y-auto">
            {loadingDeals ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 bg-vault-elevated rounded-xl animate-pulse" />
                ))}
              </div>
            ) : deals.length === 0 ? (
              <p className="p-6 text-center text-vault-textSecondary text-sm">No active deals</p>
            ) : (
              <div className="divide-y divide-vault-border">
                {deals.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => toggleDealOfWeek(d.id, d.is_deal_of_week)}
                      className={`p-1.5 rounded-lg transition-colors shrink-0 ${d.is_deal_of_week ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-vault-elevated text-vault-textHint hover:text-white'}`}
                    >
                      <Star className={`w-4 h-4 ${d.is_deal_of_week ? 'fill-yellow-400' : ''}`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${d.is_deal_of_week ? 'text-white' : 'text-vault-textSecondary'}`}>
                        {d.title}
                      </p>
                      <p className="text-vault-textHint text-xs truncate">{d.business_name} · {d.discount_percentage}% OFF</p>
                    </div>
                    {d.is_deal_of_week && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 shrink-0">
                        Featured
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Verified Businesses */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-vault-primary" />
            <h2 className="text-lg font-semibold text-white">Verified Businesses</h2>
            <span className="ml-auto text-vault-textSecondary text-sm">{verifiedBiz.length} verified</span>
          </div>

          <div className="bg-vault-card rounded-2xl border border-vault-border overflow-hidden max-h-[500px] overflow-y-auto">
            {loadingBiz ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 bg-vault-elevated rounded-xl animate-pulse" />
                ))}
              </div>
            ) : businesses.length === 0 ? (
              <p className="p-6 text-center text-vault-textSecondary text-sm">No approved businesses</p>
            ) : (
              <div className="divide-y divide-vault-border">
                {businesses.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => toggleVerified(b.id, b.is_verified)}
                      className={`p-1.5 rounded-lg transition-colors shrink-0 ${b.is_verified ? 'bg-vault-primary/20 text-vault-primary hover:bg-vault-primary/30' : 'bg-vault-elevated text-vault-textHint hover:text-white'}`}
                    >
                      <BadgeCheck className="w-4 h-4" />
                    </button>
                    {b.logo_url ? (
                      <img src={b.logo_url} alt={b.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-vault-elevated flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-vault-textHint" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${b.is_verified ? 'text-white' : 'text-vault-textSecondary'}`}>
                        {b.name}
                      </p>
                      <p className="text-vault-textHint text-xs truncate">{b.category_name} · {b.city}</p>
                    </div>
                    {b.is_verified && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-vault-primary/20 text-vault-primary shrink-0">
                        Verified
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick summary */}
      <div className="bg-vault-card rounded-2xl border border-vault-border p-5">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Tag className="w-4 h-4 text-vault-primary" />
          Current Featured Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-vault-textSecondary text-xs font-medium uppercase tracking-wider mb-2">Deals of the Week ({dealsOfWeek.length})</p>
            {dealsOfWeek.length === 0 ? (
              <p className="text-vault-textHint text-sm">None selected</p>
            ) : (
              <ul className="space-y-1">
                {dealsOfWeek.map(d => (
                  <li key={d.id} className="text-sm text-white flex items-center gap-1.5">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
                    {d.title} <span className="text-vault-textHint">({d.business_name})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="text-vault-textSecondary text-xs font-medium uppercase tracking-wider mb-2">Verified Businesses ({verifiedBiz.length})</p>
            {verifiedBiz.length === 0 ? (
              <p className="text-vault-textHint text-sm">None verified</p>
            ) : (
              <ul className="space-y-1">
                {verifiedBiz.map(b => (
                  <li key={b.id} className="text-sm text-white flex items-center gap-1.5">
                    <BadgeCheck className="w-3 h-3 text-vault-primary shrink-0" />
                    {b.name} <span className="text-vault-textHint">({b.city})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
