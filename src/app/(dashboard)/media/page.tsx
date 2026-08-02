'use client';

import { useEffect, useState } from 'react';
import { Film, Plus, Trash2, ExternalLink } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

type PlatformLink = { platform: string; url: string };

type MediaPost = {
  id: string;
  title: string;
  caption: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  video_provider: 'youtube' | 'file' | 'external';
  platforms: PlatformLink[];
  published_at: string;
  is_published: boolean;
  sort_order: number;
};

const emptyForm = {
  title: '',
  caption: '',
  thumbnail_url: '',
  video_url: '',
  video_provider: 'youtube' as const,
  platforms_text: '',
  is_published: true,
  sort_order: 0,
};

function platformsToText(platforms: PlatformLink[] | null | undefined) {
  if (!platforms?.length) return '';
  return platforms.map((p) => `${p.platform}|${p.url}`).join('\n');
}

function textToPlatforms(text: string): PlatformLink[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const sep = line.indexOf('|');
      if (sep === -1) return { platform: 'link', url: line };
      return { platform: line.slice(0, sep).trim().toLowerCase(), url: line.slice(sep + 1).trim() };
    })
    .filter((p) => p.url);
}

export default function MediaAdminPage() {
  const [posts, setPosts] = useState<MediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ posts: MediaPost[] }>('/admin/media');
      setPosts(data.posts ?? []);
    } catch (e: unknown) {
      setPosts([]);
      setError(e instanceof Error ? e.message : 'Failed to load media');
    }
    setLoading(false);
  }

  function startEdit(post: MediaPost) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      caption: post.caption ?? '',
      thumbnail_url: post.thumbnail_url ?? '',
      video_url: post.video_url ?? '',
      video_provider: post.video_provider,
      platforms_text: platformsToText(post.platforms),
      is_published: post.is_published,
      sort_order: post.sort_order ?? 0,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = {
      title: form.title,
      caption: form.caption || null,
      thumbnail_url: form.thumbnail_url || null,
      video_url: form.video_url || null,
      video_provider: form.video_provider,
      platforms: textToPlatforms(form.platforms_text),
      is_published: form.is_published,
      sort_order: Number(form.sort_order) || 0,
    };
    try {
      if (editingId) {
        await apiFetch(`/admin/media/${editingId}`, { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await apiFetch('/admin/media', { method: 'POST', body: JSON.stringify(body) });
      }
      resetForm();
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm('Delete this media post?')) return;
    await apiFetch(`/admin/media/${id}`, { method: 'DELETE' });
    if (editingId === id) resetForm();
    load();
  }

  async function togglePublish(post: MediaPost) {
    await apiFetch(`/admin/media/${post.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_published: !post.is_published }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Film className="w-6 h-6 text-vault-primary" />
          Media Hub
        </h1>
        <p className="text-vault-textSecondary text-sm mt-1">
          One post per video. Add Instagram / TikTok / YouTube links on the same post — never create duplicates for each platform.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      <form onSubmit={save} className="bg-vault-card border border-vault-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-white font-semibold">{editingId ? 'Edit post' : 'New media post'}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-xs text-vault-textHint hover:text-white">
              Cancel edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            required
            className="bg-vault-surface border border-vault-border rounded-xl px-3 py-2 text-white text-sm"
          />
          <select
            value={form.video_provider}
            onChange={(e) => setForm({ ...form, video_provider: e.target.value as MediaPost['video_provider'] })}
            className="bg-vault-surface border border-vault-border rounded-xl px-3 py-2 text-white text-sm"
          >
            <option value="youtube">YouTube (in-app)</option>
            <option value="file">Direct MP4 / file URL</option>
            <option value="external">External only (open platform)</option>
          </select>
        </div>

        <textarea
          value={form.caption}
          onChange={(e) => setForm({ ...form, caption: e.target.value })}
          placeholder="Caption"
          rows={2}
          className="w-full bg-vault-surface border border-vault-border rounded-xl px-3 py-2 text-white text-sm"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={form.video_url}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            placeholder="Primary video URL (YouTube or MP4)"
            className="bg-vault-surface border border-vault-border rounded-xl px-3 py-2 text-white text-sm"
          />
          <input
            value={form.thumbnail_url}
            onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
            placeholder="Thumbnail image URL"
            className="bg-vault-surface border border-vault-border rounded-xl px-3 py-2 text-white text-sm"
          />
        </div>

        <textarea
          value={form.platforms_text}
          onChange={(e) => setForm({ ...form, platforms_text: e.target.value })}
          placeholder={'Platform links (one per line): platform|url\ninstagram|https://...\ntiktok|https://...\nyoutube|https://...'}
          rows={4}
          className="w-full bg-vault-surface border border-vault-border rounded-xl px-3 py-2 text-white text-sm font-mono"
        />

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-vault-textSecondary">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm text-vault-textSecondary">
            Sort
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="w-20 bg-vault-surface border border-vault-border rounded-xl px-3 py-1.5 text-white text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="ml-auto inline-flex items-center gap-2 bg-vault-primary text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            {saving ? 'Saving…' : editingId ? 'Update post' : 'Add post'}
          </button>
        </div>
      </form>

      <div className="bg-vault-card border border-vault-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-vault-surface text-vault-textSecondary">
            <tr>
              <th className="text-left px-4 py-3">Post</th>
              <th className="text-left px-4 py-3">Provider</th>
              <th className="text-left px-4 py-3">Platforms</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-vault-textSecondary">
                  Loading…
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-vault-textSecondary">
                  No media posts yet. Add your first creative above.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.thumbnail_url} alt="" className="w-14 h-10 rounded-lg object-cover bg-vault-elevated" />
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-vault-elevated flex items-center justify-center">
                          <Film className="w-4 h-4 text-vault-textHint" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">{post.title}</p>
                        <p className="text-vault-textHint text-xs truncate max-w-[280px]">{post.caption}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-vault-textSecondary capitalize">{post.video_provider}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(post.platforms ?? []).map((p) => (
                        <a
                          key={`${p.platform}-${p.url}`}
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-vault-elevated text-vault-textSecondary hover:text-white"
                        >
                          {p.platform}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(post)}
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        post.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {post.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(post)} className="text-vault-primary text-xs font-medium hover:underline">
                        Edit
                      </button>
                      <button onClick={() => remove(post.id)} className="text-red-400 p-1 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
