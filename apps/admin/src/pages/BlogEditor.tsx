import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, ImagePlus, Loader2, Pencil, Plus, Search, SquareArrowOutUpRight, X } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { PageHeader } from '../components/PageHeader';
import { dateFormat } from '../lib/orderFormat';
import { renderMarkdownPreview } from '../lib/simpleMarkdown';
import type { CoverImage, PostCategoryRow, PostFormBody, PostRow, PostStatus } from '../lib/blogTypes';

const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3000';

type ProductOption = { id: string; name: string };
type CategoryListEnvelope = { data: PostCategoryRow[] };
type ProductListEnvelope = { data: ProductOption[] };
type PostEnvelope = { data: PostRow };

const inputClass =
  'w-full h-10 px-3 rounded-sm border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]';
const labelClass = 'block text-sm font-semibold text-text-secondary mb-1';

function previewSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function counterClass(len: number, ideal: number, max: number) {
  if (len === 0) return 'text-text-muted';
  if (len > max) return 'text-danger';
  if (len > ideal) return 'text-warning';
  return 'text-success';
}

export function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const mode = id ? 'edit' : 'create';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(mode === 'edit');
  const [loadError, setLoadError] = useState(false);
  const [post, setPost] = useState<PostRow | null>(null);

  const [categories, setCategories] = useState<PostCategoryRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);

  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategorySubmitting, setCreatingCategorySubmitting] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [view, setView] = useState<'editor' | 'preview'>('editor');

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [status, setStatus] = useState<PostStatus>('draft');
  const [coverImage, setCoverImage] = useState<CoverImage | null>(null);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const res = (await apiClient.get('/blog/categories')) as CategoryListEnvelope;
      setCategories(res.data);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const res = (await apiClient.get('/products/admin/all', { params: { limit: 200 } })) as ProductListEnvelope;
      setProducts(res.data);
    } catch {
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [loadCategories, loadProducts]);

  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    setLoading(true);
    setLoadError(false);
    apiClient
      .get(`/blog/admin/${id}`)
      .then((res) => {
        const p = (res as PostEnvelope).data;
        setPost(p);
        setTitle(p.title);
        setExcerpt(p.excerpt);
        setContent(p.content);
        setCategoryId(p.category?.id ?? '');
        setRelatedProductIds(p.relatedProducts?.map((rp) => rp.id) ?? []);
        setStatus(p.status);
        setCoverImage(p.coverImage ?? null);
        setMetaTitle(p.metaTitle ?? '');
        setMetaDescription(p.metaDescription ?? '');
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [mode, id]);

  const wordCount = useMemo(() => (content.trim() ? content.trim().split(/\s+/).length : 0), [content]);
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const slug = post ? post.slug : previewSlug(title);
  const previewHtml = useMemo(() => renderMarkdownPreview(content), [content]);

  const visibleProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, productSearch]);

  async function handleCoverFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setImageError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = (await apiClient.post('/media/upload', formData)) as {
        data: { url: string; publicId: string; width: number; height: number };
      };
      if (coverImage) apiClient.delete(`/media/${encodeURIComponent(coverImage.publicId)}`).catch(() => null);
      setCoverImage({ url: res.data.url, publicId: res.data.publicId, alt: '', width: res.data.width, height: res.data.height });
    } catch {
      setImageError('Tải ảnh lên thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRemoveCover() {
    if (coverImage) apiClient.delete(`/media/${encodeURIComponent(coverImage.publicId)}`).catch(() => null);
    setCoverImage(null);
  }

  async function handleCreateCategory() {
    const name = newCategoryName.trim();
    if (name.length < 2) return setCategoryError('Tên chủ đề tối thiểu 2 ký tự.');
    setCategoryError(null);
    setCreatingCategorySubmitting(true);
    try {
      const res = (await apiClient.post('/blog/categories', { name })) as { data: PostCategoryRow };
      setCategories((prev) => [...prev, res.data]);
      setCategoryId(res.data.id);
      setCreatingCategory(false);
      setNewCategoryName('');
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Không thể tạo chủ đề.';
      setCategoryError(message);
    } finally {
      setCreatingCategorySubmitting(false);
    }
  }

  function toggleProduct(pid: string) {
    setRelatedProductIds((prev) => (prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    const trimmedTitle = title.trim();
    const trimmedExcerpt = excerpt.trim();
    const trimmedContent = content.trim();

    if (trimmedTitle.length < 5) return setValidationError('Tiêu đề tối thiểu 5 ký tự.');
    if (trimmedExcerpt.length < 20) return setValidationError('Mô tả ngắn tối thiểu 20 ký tự.');
    if (trimmedContent.length < 50) return setValidationError('Nội dung tối thiểu 50 ký tự.');

    const body: PostFormBody = {
      title: trimmedTitle,
      excerpt: trimmedExcerpt,
      content: trimmedContent,
      coverImage,
      categoryId: categoryId || undefined,
      relatedProductIds,
      status,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (mode === 'create') {
        const res = (await apiClient.post('/blog', body)) as PostEnvelope;
        navigate(`/blog/${res.data.id}`, { replace: true });
      } else if (id) {
        const res = (await apiClient.patch(`/blog/${id}`, body)) as PostEnvelope;
        setPost(res.data);
      }
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Không thể lưu bài viết.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const displayError = validationError ?? submitError;
  const seoTitle = metaTitle.trim() || title.trim() || 'Tiêu đề bài viết';
  const seoDescription = metaDescription.trim() || excerpt.trim() || 'Mô tả ngắn sẽ hiển thị ở đây.';
  const categoryName = categories.find((c) => c.id === categoryId)?.name;

  if (loading) {
    return (
      <div>
        <PageHeader title="Đang tải bài viết..." />
        <div className="bg-card rounded-md shadow-sm h-96 animate-pulse" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <PageHeader title="Không tìm thấy bài viết" />
        <div className="bg-card rounded-md shadow-sm py-16 px-6 text-center text-text-secondary text-sm">
          Bài viết không tồn tại hoặc đã bị xóa.
          <div className="mt-4">
            <button
              type="button"
              onClick={() => navigate('/blog')}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border text-sm font-semibold text-text-secondary hover:bg-background-alt transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <PageHeader
        title={mode === 'create' ? 'Viết bài mới' : title || 'Sửa bài viết'}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/blog')}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border text-sm font-semibold text-text-secondary hover:bg-background-alt transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Quay lại
            </button>

            <div className="inline-flex items-center gap-1 rounded-md border border-border p-1">
              <button
                type="button"
                onClick={() => setView('editor')}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-sm text-sm font-medium cursor-pointer transition-colors ${view === 'editor' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background-alt'}`}
              >
                <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                Soạn thảo
              </button>
              <button
                type="button"
                onClick={() => setView('preview')}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-sm text-sm font-medium cursor-pointer transition-colors ${view === 'preview' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background-alt'}`}
              >
                <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                Xem như khách hàng
              </button>
            </div>

            {mode === 'edit' && post?.status === 'published' && (
              <a
                href={`${STOREFRONT_URL}/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border text-sm font-semibold text-text-secondary hover:bg-background-alt transition-colors cursor-pointer"
              >
                <SquareArrowOutUpRight className="w-4 h-4" strokeWidth={1.5} />
                Mở trên website
              </a>
            )}

            <button
              type="submit"
              disabled={submitting || uploading}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
            >
              {submitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo bài viết' : 'Lưu thay đổi'}
            </button>
          </div>
        }
      />

      {displayError && <p className="text-sm text-danger mb-4">{displayError}</p>}

      {view === 'preview' ? (
        <div className="bg-card rounded-md shadow-sm p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4 text-sm">
              {categoryName && <span className="text-primary font-bold uppercase tracking-wider">{categoryName}</span>}
              <span className="text-text-muted">•</span>
              <time className="text-text-secondary">{dateFormat.format(new Date())}</time>
              <span className="text-text-muted">•</span>
              <span className="text-text-secondary">~{readingMinutes} phút đọc</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-6 leading-tight tracking-tight text-center font-[family-name:var(--font-display)]">
              {title || 'Tiêu đề bài viết'}
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed text-center mb-10">
              {excerpt || 'Mô tả ngắn của bài viết sẽ hiển thị ở đây.'}
            </p>
            {coverImage && (
              <div className="aspect-[21/9] bg-background-alt rounded-2xl overflow-hidden mb-10 shadow-md">
                <img src={coverImage.url} alt={coverImage.alt} className="w-full h-full object-cover" />
              </div>
            )}
            <div
              className="max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:leading-relaxed [&_p]:text-text-secondary [&_p]:mb-4 [&_a]:text-primary [&_a]:font-medium [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:text-text-secondary [&_li]:mb-1 text-text-primary"
              dangerouslySetInnerHTML={{ __html: previewHtml || '<p>Nội dung bài viết sẽ hiển thị ở đây.</p>' }}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-md shadow-sm p-5">
              <label htmlFor="be-title" className={labelClass}>Tiêu đề</label>
              <input id="be-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Bí quyết chọn bánh tráng ngon..." />
              <p className="mt-1 text-xs text-text-muted">
                URL: /blog/<span className="font-mono">{slug || '...'}</span>
                {mode === 'create' && ' (dự kiến — tạo tự động từ tiêu đề)'}
              </p>

              <label htmlFor="be-excerpt" className={`${labelClass} mt-4`}>Mô tả ngắn (excerpt)</label>
              <textarea
                id="be-excerpt"
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-sm border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)] resize-none"
                placeholder="Tóm tắt ngắn gọn, hiển thị ở trang danh sách bài viết..."
              />
              <p className="mt-1 text-xs text-text-muted">{excerpt.trim().length} ký tự (tối thiểu 20)</p>

              <label htmlFor="be-content" className={`${labelClass} mt-4`}>Nội dung (Markdown)</label>
              <textarea
                id="be-content"
                rows={20}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2.5 rounded-sm border border-border bg-surface text-sm font-mono outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)] resize-y"
                placeholder="## Tiêu đề phụ&#10;&#10;Viết nội dung bài blog ở đây, hỗ trợ Markdown (in đậm, danh sách, liên kết...)."
              />
              <p className="mt-1 text-xs text-text-muted">{wordCount} từ · ~{readingMinutes} phút đọc</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-md shadow-sm p-5">
              <label className={labelClass}>Ảnh bìa</label>
              <div className="flex items-center gap-3 mb-1">
                {coverImage ? (
                  <div className="relative w-full aspect-video rounded-md overflow-hidden bg-background-alt">
                    <img src={coverImage.url} alt={coverImage.alt} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[rgba(43,29,20,0.6)] text-white flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full aspect-video rounded-md border border-dashed border-border flex items-center justify-center text-text-muted hover:bg-background-alt transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => handleCoverFile(e.target.files)}
                />
              </div>
              {coverImage && (
                <input
                  value={coverImage.alt}
                  onChange={(e) => setCoverImage((prev) => (prev ? { ...prev, alt: e.target.value } : prev))}
                  className={`${inputClass} mt-2`}
                  placeholder="Mô tả ảnh (alt text — tốt cho SEO hình ảnh)"
                />
              )}
              {imageError && <p className="mt-2 text-sm text-danger">{imageError}</p>}
            </div>

            <div className="bg-card rounded-md shadow-sm p-5 space-y-3">
              <div>
                <label htmlFor="be-status" className={labelClass}>Trạng thái</label>
                <select id="be-status" value={status} onChange={(e) => setStatus(e.target.value as PostStatus)} className={inputClass}>
                  <option value="draft">Bản nháp</option>
                  <option value="published">Đã đăng</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="be-category" className="text-sm font-semibold text-text-secondary">Chủ đề</label>
                  <button
                    type="button"
                    onClick={() => setCreatingCategory((v) => !v)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                    Chủ đề mới
                  </button>
                </div>
                <select id="be-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
                  <option value="">Chưa phân loại</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {creatingCategory && (
                  <div className="mt-2 flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        autoFocus
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreateCategory();
                          }
                        }}
                        className={inputClass}
                        placeholder="Tên chủ đề (VD: Công thức)"
                      />
                      {categoryError && <p className="mt-1 text-xs text-danger">{categoryError}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={creatingCategorySubmitting}
                      className="h-10 px-3 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                    >
                      {creatingCategorySubmitting ? '...' : 'Tạo'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreatingCategory(false);
                        setNewCategoryName('');
                        setCategoryError(null);
                      }}
                      className="h-10 px-2 rounded-md text-text-secondary hover:bg-background-alt transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card rounded-md shadow-sm p-5">
              <label className={labelClass}>Sản phẩm liên quan (tùy chọn)</label>
              <div className="rounded-md border border-border">
                <div className="relative p-2 border-b border-divider">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" strokeWidth={1.5} />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Tìm sản phẩm..."
                    className="w-full h-8 pl-7 pr-3 rounded-sm bg-surface text-sm outline-none"
                  />
                </div>
                <div className="max-h-36 overflow-y-auto p-2 flex flex-wrap gap-1.5">
                  {visibleProducts.length === 0 && <p className="text-xs text-text-muted p-1.5">Không tìm thấy sản phẩm.</p>}
                  {visibleProducts.map((p) => {
                    const checked = relatedProductIds.includes(p.id);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => toggleProduct(p.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          checked ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:bg-background-alt'
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-md shadow-sm p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Tối ưu SEO</h3>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="be-meta-title" className="text-sm font-semibold text-text-secondary">Meta title</label>
                  <span className={`text-xs ${counterClass(metaTitle.length, 60, 70)}`}>{metaTitle.length}/60</span>
                </div>
                <input
                  id="be-meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className={inputClass}
                  placeholder={title || 'Mặc định dùng tiêu đề bài viết'}
                />
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="be-meta-desc" className="text-sm font-semibold text-text-secondary">Meta description</label>
                  <span className={`text-xs ${counterClass(metaDescription.length, 160, 180)}`}>{metaDescription.length}/160</span>
                </div>
                <textarea
                  id="be-meta-desc"
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-sm border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)] resize-none"
                  placeholder={excerpt || 'Mặc định dùng mô tả ngắn'}
                />
              </div>

              <div className="mt-3 rounded-md border border-border p-3 bg-surface">
                <p className="text-xs text-text-muted mb-2">Xem trước kết quả tìm kiếm Google</p>
                <p className="text-[13px] text-success truncate">banhtrangnhana.vn › blog › {slug || '...'}</p>
                <p className="text-[16px] text-[#1a0dab] leading-snug truncate">{seoTitle}</p>
                <p className="text-sm text-text-secondary line-clamp-2">{seoDescription}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
