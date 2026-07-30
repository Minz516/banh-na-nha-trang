import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Eye, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { dateFormat } from '../lib/orderFormat';
import type { PostCategoryRow, PostRow } from '../lib/blogTypes';

type PostListEnvelope = { data: { items: PostRow[]; total: number } };
type CategoryListEnvelope = { data: PostCategoryRow[] };
type StatusFilter = 'all' | 'draft' | 'published';

function DeleteConfirmModal({ postTitle, submitting, onConfirm, onClose }: { postTitle: string; submitting: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 bg-[rgba(43,29,20,0.4)]" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-lg max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text-primary mb-1">Xóa bài viết</h2>
        <p className="text-sm text-text-secondary mb-5">
          Bạn có chắc muốn xóa <span className="font-medium text-text-primary">{postTitle}</span>? Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-md border border-border text-sm font-semibold text-text-secondary hover:bg-background-alt transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className="flex-1 h-10 rounded-md bg-danger text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
          >
            {submitting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Blog() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [categories, setCategories] = useState<PostCategoryRow[] | null>(null);
  const [posts, setPosts] = useState<PostRow[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PostRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const res = (await apiClient.get('/blog/categories')) as CategoryListEnvelope;
      setCategories(res.data);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadPosts = useCallback(async (q: string) => {
    setError(false);
    try {
      const params: Record<string, string | number> = { limit: 50 };
      if (q.trim()) params.search = q.trim();
      const res = (await apiClient.get('/blog/admin/all', { params })) as PostListEnvelope;
      setPosts(res.data.items);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    setPosts(null);
    const timeout = setTimeout(() => loadPosts(search), 300);
    return () => clearTimeout(timeout);
  }, [search, loadPosts]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([loadCategories(), loadPosts(search)]);
    } finally {
      setRefreshing(false);
    }
  }

  const visiblePosts = useMemo(() => {
    if (!posts) return null;
    return posts.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (categoryFilter && p.category?.id !== categoryFilter) return false;
      return true;
    });
  }, [posts, statusFilter, categoryFilter]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/blog/${deleteTarget.id}`);
      setDeleteTarget(null);
      await loadPosts(search);
    } catch {
      // Leave the confirm dialog open with its default state so staff can retry.
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Bài viết"
        description="Viết và quản lý nội dung blog — hiển thị ở mục “Câu chuyện” trên website."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border text-sm font-semibold text-text-secondary hover:bg-background-alt transition-colors disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
              Làm mới
            </button>
            <button
              type="button"
              onClick={() => navigate('/blog/new')}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Viết bài mới
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative max-w-sm flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề bài viết..."
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
        >
          <option value="">Tất cả chủ đề</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="h-10 px-3 rounded-md border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="draft">Bản nháp</option>
          <option value="published">Đã đăng</option>
        </select>
      </div>

      {error && (
        <div className="bg-card rounded-md shadow-sm py-16 px-6 text-center text-text-secondary text-sm">
          Không thể tải danh sách bài viết.
        </div>
      )}

      {!error && visiblePosts !== null && visiblePosts.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Chưa có bài viết nào"
          description="Nhấn “Viết bài mới” để đăng bài đầu tiên lên mục Câu chuyện."
        />
      )}

      {!error && visiblePosts === null && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-md shadow-sm h-16 animate-pulse" />
          ))}
        </div>
      )}

      {!error && visiblePosts !== null && visiblePosts.length > 0 && (
        <div className="bg-card rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[8%]" />
                <col className="w-[32%]" />
                <col className="w-[15%]" />
                <col className="w-[13%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-divider text-left text-text-secondary">
                  <th className="px-5 py-3 font-medium">Ảnh</th>
                  <th className="px-5 py-3 font-medium">Bài viết</th>
                  <th className="px-5 py-3 font-medium">Chủ đề</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                  <th className="px-5 py-3 font-medium">Ngày đăng</th>
                  <th className="px-5 py-3 font-medium text-right">Lượt xem</th>
                  <th className="px-5 py-3 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {visiblePosts.map((p) => (
                  <tr key={p.id} className="hover:bg-card-hover transition-colors">
                    <td className="px-5 py-3">
                      <div className="w-10 h-10 rounded-sm overflow-hidden bg-background-alt shrink-0">
                        {p.coverImage ? (
                          <img src={p.coverImage.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted">
                            <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 truncate">
                      <span className="font-medium text-text-primary truncate block">{p.title}</span>
                      <span className="text-xs text-text-muted truncate block">/blog/{p.slug}</span>
                    </td>
                    <td className="px-5 py-3 text-text-secondary truncate">{p.category?.name ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${p.status === 'published' ? 'bg-success/10 text-success' : 'bg-text-secondary/10 text-text-secondary'}`}
                      >
                        {p.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-secondary whitespace-nowrap">
                      {p.publishedAt ? dateFormat.format(new Date(p.publishedAt)) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-text-secondary">
                        <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {p.viewCount}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/blog/${p.id}`)}
                          className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:bg-background-alt hover:text-primary cursor-pointer"
                          title="Sửa"
                        >
                          <Pencil className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p)}
                          className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:bg-danger/10 hover:text-danger cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          postTitle={deleteTarget.title}
          submitting={deleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
