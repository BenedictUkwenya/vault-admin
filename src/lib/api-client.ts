import { createClient } from '@/lib/supabase';

const API_BASE =
  typeof window !== 'undefined'
    ? '/api/backend'
    : process.env.NEXT_PUBLIC_API_URL ||
      (process.env.VAULT_BACKEND_URL ? `${process.env.VAULT_BACKEND_URL}/api` : 'https://vault-backend-rho.vercel.app/api');

async function getToken() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function apiFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const adminApi = {
  updateUser: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  approveBusiness: (id: string) =>
    apiFetch(`/admin/businesses/${id}/approve`, { method: 'PATCH' }),
  rejectBusiness: (id: string, reason?: string) =>
    apiFetch(`/admin/businesses/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  approveDeal: (id: string) => apiFetch(`/admin/deals/${id}/approve`, { method: 'PATCH' }),
  rejectDeal: (id: string, reason?: string) =>
    apiFetch(`/admin/deals/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  deleteDeal: (id: string) => apiFetch(`/admin/deals/${id}`, { method: 'DELETE' }),
  toggleFeatured: (id: string, is_featured: boolean) =>
    apiFetch(`/admin/businesses/${id}/featured`, { method: 'PATCH', body: JSON.stringify({ is_featured }) }),
  broadcastNotification: (body: { title: string; body: string; type?: string; user_ids?: string[] }) =>
    apiFetch('/admin/notifications/broadcast', { method: 'POST', body: JSON.stringify(body) }),
  listNetworkApplications: (status?: string) =>
    apiFetch<{ applications: NetworkApplication[]; total: number }>(
      `/network/applications${status ? `?status=${encodeURIComponent(status)}` : ''}`
    ),
  approveNetworkApplication: (
    id: string,
    body?: { membership_tier?: string; notes?: string; comp_membership?: boolean }
  ) =>
    apiFetch(`/network/applications/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),
  rejectNetworkApplication: (id: string, notes?: string) =>
    apiFetch(`/network/applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
};

export type NetworkApplication = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  business_description: string | null;
  is_student: boolean;
  membership_interest: string;
  hear_about: string;
  applicant_type: 'member' | 'partner';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'contacted';
  notes: string | null;
  source_page: string | null;
  granted_tier?: string | null;
  invited_user_id?: string | null;
  invited_at?: string | null;
  invite_error?: string | null;
  created_at: string;
  updated_at?: string;
};

export const partnerApi = {
  businessMy: () => apiFetch('/businesses/my/profile'),
  businessAnalytics: () => apiFetch('/businesses/my/analytics'),
  businessBookings: () => apiFetch('/bookings/business'),
  businessDeals: () => apiFetch('/deals/business'),
  subscriptionsPortal: () => apiFetch('/subscriptions/portal', { method: 'POST' }),
  referralsStats: () => apiFetch('/referrals/stats'),
  walletHistory: () => apiFetch('/users/wallet/history'),
  notifications: () => apiFetch('/notifications'),
  ambassadorDashboard: () => apiFetch('/ambassadors/dashboard'),
  ambassadorReferrals: () => apiFetch('/ambassadors/referrals'),
  ambassadorRewards: () => apiFetch('/ambassadors/rewards'),
  ambassadorLeaderboard: () => apiFetch('/ambassadors/leaderboard'),
};
