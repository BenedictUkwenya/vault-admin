'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  adminApi,
  type NetworkApplication,
} from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, Inbox, X } from 'lucide-react';

type Filter = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'all';
type Tier = 'free' | 'student' | 'member' | 'vip';

function suggestTier(app: NetworkApplication): Tier {
  if (app.is_student) return 'student';
  const interest = (app.membership_interest || '').toLowerCase();
  if (interest.includes('vip')) return 'vip';
  return 'member';
}

function statusTone(status: string) {
  switch (status) {
    case 'approved':
      return 'bg-green-500/20 text-green-400';
    case 'rejected':
      return 'bg-red-500/20 text-red-400';
    case 'reviewing':
      return 'bg-blue-500/20 text-blue-400';
    case 'contacted':
      return 'bg-purple-500/20 text-purple-400';
    default:
      return 'bg-yellow-500/20 text-yellow-400';
  }
}

export default function NetworkApplicationsPage() {
  const [applications, setApplications] = useState<NetworkApplication[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<NetworkApplication | null>(null);
  const [approveTarget, setApproveTarget] = useState<NetworkApplication | null>(null);
  const [approveTier, setApproveTier] = useState<Tier>('member');
  const [compMembership, setCompMembership] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<NetworkApplication | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setActionError('');
    try {
      const data = await adminApi.listNetworkApplications(filter === 'all' ? undefined : filter);
      setApplications(data.applications ?? []);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  function openApprove(app: NetworkApplication) {
    setApproveTarget(app);
    setApproveTier(suggestTier(app));
    setCompMembership(false);
    setSuccessMsg('');
    setActionError('');
  }

  async function confirmApprove() {
    if (!approveTarget) return;
    setActionLoading(approveTarget.id);
    setActionError('');
    setSuccessMsg('');
    try {
      const result = (await adminApi.approveNetworkApplication(approveTarget.id, {
        membership_tier: approveTier,
        comp_membership: compMembership,
      })) as { message?: string };
      setSuccessMsg(result.message || 'Approved and invited.');
      setApproveTarget(null);
      await fetchApps();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Approve failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function confirmReject() {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget.id);
    setActionError('');
    try {
      await adminApi.rejectNetworkApplication(rejectTarget.id, rejectNotes || undefined);
      setRejectTarget(null);
      setRejectNotes('');
      await fetchApps();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Reject failed');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Network Applications</h1>
          <p className="text-sm text-vault-textSecondary mt-1">
            Approve to invite applicants. They pay for Student / Member / VIP in the mobile app.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['pending', 'reviewing', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-vault-primary text-white'
                  : 'bg-vault-card border border-vault-border text-vault-textSecondary hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {successMsg}
        </div>
      )}

      <div className="bg-vault-card rounded-2xl border border-vault-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-vault-surface text-vault-textSecondary">
              <tr>
                <th className="text-left px-4 py-3">Applicant</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Interest</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Submitted</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vault-border">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-vault-elevated rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-vault-textSecondary">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No applications found
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-vault-elevated/40 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(app)}
                        className="text-left"
                      >
                        <div className="font-medium text-white hover:text-vault-primary">
                          {app.full_name}
                        </div>
                        <div className="text-vault-textSecondary text-xs">{app.email}</div>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-vault-textSecondary capitalize">
                      {app.applicant_type}
                      {app.is_student ? ' · student' : ''}
                    </td>
                    <td className="px-4 py-3 text-vault-textSecondary">{app.membership_interest}</td>
                    <td className="px-4 py-3 text-vault-textSecondary">{app.location}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusTone(app.status)}`}>
                        {app.status}
                      </span>
                      {app.granted_tier && (
                        <div className="text-xs text-vault-textHint mt-1">tier: {app.granted_tier}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-vault-textSecondary">{formatDate(app.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {app.status !== 'approved' && app.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => openApprove(app)}
                            disabled={actionLoading === app.id}
                            className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50"
                            title="Approve & invite"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {app.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => {
                              setRejectTarget(app);
                              setRejectNotes('');
                            }}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/50" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-md bg-vault-card border-l border-vault-border h-full overflow-y-auto p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-display font-bold text-white">{selected.full_name}</h2>
                <p className="text-sm text-vault-textSecondary">{selected.email}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="text-vault-textHint hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {[
              ['Phone', selected.phone],
              ['Location', selected.location],
              ['Type', selected.applicant_type],
              ['Student', selected.is_student ? 'Yes' : 'No'],
              ['Interest', selected.membership_interest],
              ['Heard about', selected.hear_about],
              ['Source', selected.source_page || '—'],
              ['Business', selected.business_description || '—'],
              ['Granted tier', selected.granted_tier || '—'],
              ['Invited', selected.invited_at ? formatDate(selected.invited_at) : '—'],
              ['Notes', selected.notes || '—'],
              ['Invite error', selected.invite_error || '—'],
            ].map(([label, value]) => (
              <div key={label as string}>
                <div className="text-xs uppercase tracking-wide text-vault-textHint">{label}</div>
                <div className="text-sm text-white mt-0.5 whitespace-pre-wrap">{value as string}</div>
              </div>
            ))}
            {selected.status !== 'approved' && selected.status !== 'rejected' && (
              <button
                type="button"
                onClick={() => {
                  openApprove(selected);
                  setSelected(null);
                }}
                className="w-full mt-4 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-500"
              >
                Approve & invite to app
              </button>
            )}
          </div>
        </div>
      )}

      {/* Approve modal */}
      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-vault-border bg-vault-card p-6 space-y-4">
            <h3 className="text-lg font-display font-bold text-white">Approve & invite</h3>
            <p className="text-sm text-vault-textSecondary">
              Invite <span className="text-white">{approveTarget.email}</span> to set a password and open the
              app. By default they stay on <span className="text-white">Free</span> until they pay in-app.
            </p>
            <label className="block text-sm text-vault-textSecondary">
              Preferred plan (Subscribe nudge)
              <select
                value={approveTier}
                onChange={(e) => setApproveTier(e.target.value as Tier)}
                className="mt-1 w-full rounded-xl bg-vault-surface border border-vault-border px-3 py-2 text-white"
              >
                <option value="free">Free (no pay nudge)</option>
                <option value="student">Student ($8.88)</option>
                <option value="member">Member ($11.11)</option>
                <option value="vip">VIP ($24.99)</option>
              </select>
            </label>
            <label className="flex items-start gap-2 text-sm text-vault-textSecondary cursor-pointer">
              <input
                type="checkbox"
                checked={compMembership}
                onChange={(e) => setCompMembership(e.target.checked)}
                className="mt-1"
              />
              <span>
                Grant complimentary membership (skip Stripe — use sparingly)
              </span>
            </label>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setApproveTarget(null)}
                className="px-4 py-2 rounded-xl text-sm text-vault-textSecondary hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmApprove}
                disabled={actionLoading === approveTarget.id}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-500 disabled:opacity-50"
              >
                {actionLoading === approveTarget.id ? 'Sending…' : 'Approve & send invite'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-vault-border bg-vault-card p-6 space-y-4">
            <h3 className="text-lg font-display font-bold text-white">Reject application</h3>
            <p className="text-sm text-vault-textSecondary">
              Reject <span className="text-white">{rejectTarget.full_name}</span>? No invite will be sent.
            </p>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Internal notes (optional)"
              rows={3}
              className="w-full rounded-xl bg-vault-surface border border-vault-border px-3 py-2 text-white text-sm"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 rounded-xl text-sm text-vault-textSecondary hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReject}
                disabled={actionLoading === rejectTarget.id}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
