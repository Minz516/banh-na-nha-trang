import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import type { CategoryRow, ProductFormBody, ProductImage, ProductRow } from '../lib/catalogTypes';

type Props = {
  mode: 'create' | 'edit';
  categories: CategoryRow[];
  product?: ProductRow | null;
  submitting: boolean;
  errorMessage: string | null;
  onSubmit: (body: ProductFormBody) => void;
  onClose: () => void;
};

const inputClass =
  'w-full h-10 px-3 rounded-sm border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]';
const labelClass = 'block text-sm font-semibold text-text-secondary mb-1';

// Section 6.12 — centered dialog, radius-lg, shadow-lg, scrim behind; long-form
// content scrolls inside the dialog rather than the page.
export function ProductFormModal({ mode, categories, product, submitting, errorMessage, onSubmit, onClose }: Props) {
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? '');
  const [flavor, setFlavor] = useState(product?.flavor ?? '');
  const [basePrice, setBasePrice] = useState(product ? String(product.basePrice) : '');
  const [hasPromo, setHasPromo] = useState(product?.promoPrice != null);
  const [promoPrice, setPromoPrice] = useState(product?.promoPrice != null ? String(product.promoPrice) : '');
  const [stock, setStock] = useState(product ? String(product.stock) : '0');
  const [tags, setTags] = useState(product?.tags.join(', ') ?? '');
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(product?.isNewArrival ?? false);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [metaTitle, setMetaTitle] = useState(product?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(product?.metaDescription ?? '');
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setImageError(null);
    setUploading(true);
    try {
      const uploaded: ProductImage[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = (await apiClient.post('/media/upload', formData)) as {
          data: { url: string; publicId: string; width: number; height: number };
        };
        uploaded.push({
          url: res.data.url,
          publicId: res.data.publicId,
          alt: '',
          width: res.data.width,
          height: res.data.height,
          sortOrder: 0,
        });
      }
      setImages((prev) => [...prev, ...uploaded].map((img, i) => ({ ...img, sortOrder: i })));
    } catch {
      setImageError('Tải ảnh lên thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleRemoveImage(publicId: string) {
    setImages((prev) => prev.filter((img) => img.publicId !== publicId).map((img, i) => ({ ...img, sortOrder: i })));
    try {
      await apiClient.delete(`/media/${encodeURIComponent(publicId)}`);
    } catch {
      // Local product no longer references this image even if the remote delete failed —
      // don't block the form on a cleanup call that has no bearing on save correctness.
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const price = Number(basePrice);
    const stockNum = Number(stock);

    if (trimmedName.length < 2) return setValidationError('Tên sản phẩm tối thiểu 2 ký tự.');
    if (trimmedDescription.length < 10) return setValidationError('Mô tả tối thiểu 10 ký tự.');
    if (!categoryId) return setValidationError('Vui lòng chọn danh mục.');
    if (!Number.isFinite(price) || price < 0) return setValidationError('Giá không hợp lệ.');
    if (!Number.isInteger(stockNum) || stockNum < 0) return setValidationError('Tồn kho không hợp lệ.');

    let promo: number | null = null;
    if (hasPromo) {
      promo = Number(promoPrice);
      if (promoPrice.trim() === '' || !Number.isFinite(promo) || promo < 0) {
        return setValidationError('Vui lòng nhập giá khuyến mãi hợp lệ.');
      }
      if (promo >= price) {
        return setValidationError('Giá khuyến mãi phải nhỏ hơn giá bán.');
      }
    }

    onSubmit({
      name: trimmedName,
      description: trimmedDescription,
      categoryId,
      flavor: flavor.trim() || undefined,
      basePrice: price,
      promoPrice: promo,
      stock: stockNum,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      images,
      isFeatured,
      isNewArrival,
      ...(mode === 'edit' ? { isActive } : {}),
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
    });
  }

  const displayError = validationError ?? errorMessage;

  return (
    <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 bg-[rgba(43,29,20,0.4)]" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text-primary">
            {mode === 'create' ? 'Thêm sản phẩm' : `Sửa sản phẩm — ${product?.name}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Images */}
        <label className={labelClass}>Hình ảnh</label>
        <div className="flex flex-wrap gap-3 mb-4">
          {images.map((img) => (
            <div key={img.publicId} className="relative w-20 h-20 rounded-md overflow-hidden bg-background-alt shrink-0">
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(img.publicId)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[rgba(43,29,20,0.6)] text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-3 h-3" strokeWidth={2} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-md border border-dashed border-border flex items-center justify-center text-text-muted hover:bg-background-alt transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" strokeWidth={1.5} />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
        {imageError && <p className="text-sm text-danger mb-4">{imageError}</p>}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2">
            <label htmlFor="pf-name" className={labelClass}>Tên sản phẩm</label>
            <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Bánh tráng trộn Nhà Na" />
          </div>

          <div className="col-span-2">
            <label htmlFor="pf-description" className={labelClass}>Mô tả</label>
            <textarea
              id="pf-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 rounded-sm border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)] resize-none"
              placeholder="Mô tả ngắn gọn về sản phẩm..."
            />
          </div>

          <div>
            <label htmlFor="pf-category" className={labelClass}>Danh mục</label>
            <select id="pf-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              {categories.length === 0 && <option value="">Chưa có danh mục</option>}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pf-flavor" className={labelClass}>Vị (tùy chọn)</label>
            <input id="pf-flavor" value={flavor} onChange={(e) => setFlavor(e.target.value)} className={inputClass} placeholder="Vị tắc, vị sa tế..." />
          </div>

          <div>
            <label htmlFor="pf-price" className={labelClass}>Giá bán (₫)</label>
            <input id="pf-price" type="number" min={0} step={1000} value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className={inputClass} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="pf-promo" className="text-sm font-semibold text-text-secondary">Giá khuyến mãi (₫)</label>
              <label className="inline-flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPromo}
                  onChange={(e) => {
                    setHasPromo(e.target.checked);
                    if (!e.target.checked) setPromoPrice('');
                  }}
                  className="w-3.5 h-3.5 accent-primary cursor-pointer"
                />
                Đang giảm giá
              </label>
            </div>
            <input
              id="pf-promo"
              type="number"
              min={0}
              step={1000}
              value={promoPrice}
              onChange={(e) => setPromoPrice(e.target.value)}
              disabled={!hasPromo}
              className={`${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`}
              placeholder="Nhập giá khuyến mãi"
            />
          </div>

          <div>
            <label htmlFor="pf-stock" className={labelClass}>Tồn kho</label>
            <input id="pf-stock" type="number" min={0} step={1} value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="pf-tags" className={labelClass}>Thẻ (phân cách bởi dấu phẩy)</label>
            <input id="pf-tags" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="cay, ăn vặt, best-seller" />
          </div>
        </div>

        <div className="flex flex-wrap gap-5 mb-4">
          <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-primary cursor-pointer" />
            Sản phẩm nổi bật
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="w-4 h-4 accent-primary cursor-pointer" />
            Sản phẩm mới
          </label>
          {mode === 'edit' && (
            <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 accent-primary cursor-pointer" />
              Đang bán (hiển thị trên website)
            </label>
          )}
        </div>

        <details className="mb-4">
          <summary className="text-sm font-semibold text-text-secondary cursor-pointer">SEO nâng cao (tùy chọn)</summary>
          <div className="grid grid-cols-1 gap-3 mt-3">
            <div>
              <label htmlFor="pf-meta-title" className={labelClass}>Meta title</label>
              <input id="pf-meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="pf-meta-desc" className={labelClass}>Meta description</label>
              <input id="pf-meta-desc" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className={inputClass} />
            </div>
          </div>
        </details>

        {displayError && <p className="text-sm text-danger mb-4">{displayError}</p>}

        <div className="flex gap-3 pt-2 border-t border-divider mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-md border border-border text-sm font-semibold text-text-secondary hover:bg-background-alt transition-colors cursor-pointer mt-4"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="flex-1 h-10 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer mt-4"
          >
            {submitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
