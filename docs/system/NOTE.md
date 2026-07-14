# NOTE.md — Đánh giá khả năng tích hợp domain & bán hàng thực tế

Ghi lại từ buổi quét toàn bộ project (storefront, admin, API, cấu hình deploy) để trả lời câu hỏi: *sau khi mua tên miền có tích hợp được không, và tung ra thị trường có bán được hàng không.*

## Kết luận ngắn gọn

Tích hợp domain **làm được, chưa ai làm**. Bán hàng: **luồng mua cốt lõi đã chạy được thật**, nhưng launch ngay bây giờ sẽ bị kẹt vì **admin chưa có cách tự quản lý sản phẩm/kho/voucher**, và có vài lỗ hổng làm mất lòng tin khách hàng ngay từ lần đầu ghé site.

---

## 1. Tích hợp tên miền

- MongoDB Atlas và Cloudinary đã là dịch vụ cloud thật — sẵn sàng cho production, không cần setup thêm.
- 3 app tách rời (`api`, `storefront`, `admin`) cần deploy riêng và trỏ domain/subdomain vào từng cái (vd: `banhtrangnhana.com` cho storefront, `api.banhtrangnhana.com` cho API, `admin.banhtrangnhana.com` cho admin). Code đã có logic phân biệt dev/production cho cookie domain (`apps/api/src/utils/token.util.ts`), nhưng hiện hardcode `.banhtrangnhana.com` — cần khớp với domain thật khi mua.
- **Chưa có file deploy nào** (Dockerfile, vercel.json, CI/CD...) — project chưa từng được deploy thử lên đâu.
- **2 lỗ hổng bảo mật bắt buộc phải vá trước khi lên thật:**
  - `apps/api/.env`: `JWT_SECRET` / `JWT_REFRESH_SECRET` vẫn là chữ mẫu (`your_jwt_access_secret_should_be_long_and_random`) — phải đổi thành chuỗi ngẫu nhiên thật.
  - `apps/api/.env`: mật khẩu admin seed sẵn là `adminPassword123` — quá yếu, phải đổi trước khi public.

→ Việc này tốn công nhưng không khó, không phải rào cản kỹ thuật lớn.

---

## 2. Có bán được hàng không

**Đã chạy được thật (đã test end-to-end):** xem sản phẩm → thêm giỏ → checkout → tạo đơn → trừ kho tự động. Chuỗi mua hàng cốt lõi hoạt động đúng.

### Chặn bán hàng thực sự — không tự vận hành được

- **Admin chỉ có tab "Đơn hàng" là làm thật** (xem/lọc/xác nhận/hủy/hoàn tất đơn). Các tab "Sản phẩm", "Khách hàng", "Cửa hàng" vẫn là màn hình "chưa xây dựng" trống trơn.
- Hệ quả: **chủ shop hiện không có cách nào tự thêm/sửa sản phẩm, đổi giá, cập nhật tồn kho, hay tạo mã giảm giá qua giao diện** — mọi thay đổi phải nhờ dev chạy seed script hoặc sửa thẳng database. Launch hôm nay = shop bị kẹt với đúng 12 sản phẩm seed sẵn mãi mãi.

### Ảnh hưởng lòng tin khách hàng (khó bán dù kỹ thuật vẫn chạy)

- Footer (`apps/storefront/components/Footer.tsx`) trỏ tới `/about` và `/order-lookup` — **cả 2 trang đều không tồn tại**, khách bấm vào ra lỗi 404 ngay.
- **Không có số điện thoại/email/địa chỉ ở đâu trên site.** Nút liên hệ nổi (`ContactWidget.tsx`) có link Zalo/Facebook/TikTok/Instagram nhưng toàn bộ đều là `href: '#'` giả, chưa điền link thật.
- Không có ô tìm kiếm/lọc sản phẩm ở storefront, dù backend (`productQuerySchema`) đã hỗ trợ sẵn tham số `search`/`category`.
- Trang checkout (`apps/storefront/app/checkout/page.tsx`) chưa có ô nhập mã voucher, dù backend (`VoucherInterfaces`, `placeOrderBodySchema.voucherCode`) đã hỗ trợ đầy đủ — nên hiện chưa chạy khuyến mãi được cho khách thật.
- Admin không còn tab quản lý blog (đã bỏ theo yêu cầu thu gọn sidebar) — bài viết blog hiện chỉ tạo được qua gọi API trực tiếp, không qua giao diện.

---

## Việc cần làm trước khi launch (ưu tiên theo thứ tự)

1. Xây giao diện quản lý **Sản phẩm** trong admin (thêm/sửa/xóa/tồn kho) — quan trọng nhất, chặn lớn nhất hiện tại.
2. Sửa hoặc xóa 2 link chết ở footer (`/about`, `/order-lookup`).
3. Thêm thông tin liên hệ thật (SĐT/email/địa chỉ) + link mạng xã hội thật vào `ContactWidget.tsx` và/hoặc footer.
4. Đổi `JWT_SECRET`/`JWT_REFRESH_SECRET` + mật khẩu admin (`ADMIN_PASSWORD` trong `.env`) trước khi deploy thật.
5. Chọn nơi host (vd: Vercel cho storefront, Railway/Render/VPS cho API, static host cho admin) + trỏ domain thật vào cả 3 app.

## Nên làm sớm sau đó

- Ô nhập voucher ở checkout.
- Tìm kiếm/lọc sản phẩm ở storefront.
- Giao diện quản lý Voucher, Khách hàng trong admin.
- Giao diện quản lý Blog trong admin (nếu vẫn muốn viết bài).
