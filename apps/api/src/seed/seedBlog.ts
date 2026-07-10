/**
 * seedBlog.ts — seeds 2 post categories and 6 posts, each linked to ≥1 product.
 * Run with: pnpm seed:blog
 * Idempotent: uses upsert by slug.
 */
import { connectDB, disconnectDB } from '../config/db.config.js';
import { PostCategoryModel, PostModel } from '../modules/blog/blog.model.js';
import { ProductModel } from '../modules/catalog/catalog.model.js';
import { slugify } from '../utils/slugify.js';

const PLACEHOLDER_IMG = (seed: string) => ({
  url: `https://picsum.photos/seed/${seed}/1200/630`,
  publicId: `blog/${seed}`,
  alt: seed,
  width: 1200,
  height: 630,
});

async function seedBlog(): Promise<void> {
  await connectDB();

  // ── Post Categories ──────────────────────────────────────────────────────────
  const postCategories = [
    { name: 'Công Thức Nấu Ăn', description: 'Công thức và hướng dẫn chế biến các món từ bánh tráng', sortOrder: 1 },
    { name: 'Câu Chuyện Nha Trang', description: 'Văn hóa ẩm thực, du lịch và con người Nha Trang', sortOrder: 2 },
  ];

  const catMap = new Map<string, string>();
  for (const c of postCategories) {
    const slug = slugify(c.name);
    const doc = await PostCategoryModel.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: { name: c.name, slug, description: c.description, sortOrder: c.sortOrder, isActive: true },
      },
      { upsert: true, new: true }
    );
    catMap.set(c.name, doc._id.toString());
    console.log(`📂 PostCategory: ${c.name}`);
  }

  // ── Get some product IDs to link ─────────────────────────────────────────────
  const allProducts = await ProductModel.find({ isActive: true }).limit(12).select('_id slug').lean();
  const pid = (i: number) => allProducts[i % allProducts.length]?._id;

  // ── Posts ────────────────────────────────────────────────────────────────────
  const posts = [
    {
      title: 'Cách Cuốn Bánh Tráng Thịt Nướng Đúng Điệu Nha Trang',
      excerpt: 'Bí quyết cuốn bánh tráng thịt nướng ngon như người Nha Trang: từ cách chọn bánh tráng mỏng đến kỹ thuật cuốn chắc tay.',
      content: `# Cách Cuốn Bánh Tráng Thịt Nướng Đúng Điệu Nha Trang

Bánh tráng cuốn thịt nướng là món ăn dân dã mà sang trọng của người Nha Trang.

## Nguyên liệu

- **Bánh tráng mỏng** Nhà Na — loại đặc biệt, không quá khô cũng không quá ướt
- Thịt nướng (heo, bò, hoặc gà)
- Rau sống: xà lách, húng quế, bạc hà
- Chuối xanh thái mỏng
- Khế chua
- Nước chấm

## Kỹ Thuật Cuốn

1. **Làm ẩm bánh tráng**: Nhúng qua nước lọc 1-2 giây, không ngâm quá lâu.
2. **Lót rau**: Đặt xà lách trước để tạo lớp lót bảo vệ.
3. **Xếp nhân**: Thịt nướng, rau thơm, chuối xanh, khế.
4. **Cuốn chặt tay**: Gập hai đầu vào trước, cuốn thẳng từ dưới lên.

## Bí Quyết

- Bánh tráng Nhà Na dày vừa phải — không bị rách khi cuốn nhân nhiều.
- Thịt nên được nướng trên than hoa để có mùi khói đặc trưng.
- Ăn ngay sau khi cuốn để bánh không bị mềm quá.`,
      categoryName: 'Công Thức Nấu Ăn',
      relatedProductIndices: [0, 1],
      status: 'published' as const,
    },
    {
      title: 'Bánh Tráng Nướng: Món Ăn Vặt Đặc Trưng Của Giới Trẻ Nha Trang',
      excerpt: 'Từ góc đường nhỏ đến xu hướng ẩm thực toàn quốc, hành trình của bánh tráng nướng Nha Trang là câu chuyện về sức sống văn hóa địa phương.',
      content: `# Bánh Tráng Nướng: Từ Góc Phố Đến Xu Hướng Toàn Quốc

Không cần nhà hàng sang trọng, không cần công thức phức tạp — bánh tráng nướng chiếm lĩnh trái tim của mọi lứa tuổi chỉ bằng hương vị giản dị mà đậm đà.

## Nguồn Gốc

Bánh tráng nướng xuất hiện ở Nha Trang từ những năm 1990. Các chị, các cô bán hàng rong trên bãi biển đã nướng bánh trên bếp than, rưới trứng và thêm hành lá — đơn giản mà hấp dẫn không kém.

## Sự Tiến Hóa Của Topping

**Thế hệ 1.0**: Trứng + hành lá + mỡ hành
**Thế hệ 2.0**: + Khô mực + tôm khô
**Thế hệ 3.0**: + Phô mai + sốt đặc biệt + topping fusion

## Điều Gì Làm Nên Khác Biệt?

Bánh tráng Nhà Na dùng gạo địa phương, phơi nắng tự nhiên, có độ giòn đặc trưng khi nướng mà các loại bánh tráng công nghiệp không có được.`,
      categoryName: 'Câu Chuyện Nha Trang',
      relatedProductIndices: [3, 4, 5],
      status: 'published' as const,
    },
    {
      title: '5 Cách Biến Tấu Bánh Tráng Trộn Siêu Ngon Cho Mùa Hè',
      excerpt: 'Mùa hè nóng bức, không gì tuyệt hơn một tô bánh tráng trộn mát lạnh. Đây là 5 công thức biến tấu sáng tạo từ đầu bếp Nhà Na.',
      content: `# 5 Cách Biến Tấu Bánh Tráng Trộn Mùa Hè

## 1. Bánh Tráng Trộn Bơ Tắc Kiểu Mới

Thay vì sate truyền thống, kết hợp bơ hạt mắc ca và nước cốt tắc tươi. Béo ngậy, chua dịu, refreshing.

## 2. Bánh Tráng Trộn Rong Biển Korean

Lấy cảm hứng từ ẩm thực Hàn Quốc: rong biển nướng, mè rang, xì dầu ít muối, dầu mè. Healthy và trendy.

## 3. Bánh Tráng Trộn Salsa Xoài

Xoài non thái sợi + ớt + rau mùi + chanh + đường. Ăn kèm bánh tráng sợi — một góc Mexico giữa lòng Nha Trang.

## 4. Bánh Tráng Trộn Hoummus Rau Củ

Hoummus từ đậu Hà Lan + bánh tráng sợi + cà rốt bào + dưa leo. Nhẹ nhàng, phù hợp ăn kiêng.

## 5. Bánh Tráng Trộn Sữa Dừa Thập Cẩm

Sữa dừa đặc + mít non + tép bưởi + đậu phộng rang. Vị ngọt béo lạ miệng của miền Tây pha chút biển cả.`,
      categoryName: 'Công Thức Nấu Ăn',
      relatedProductIndices: [6, 7, 8],
      status: 'published' as const,
    },
    {
      title: 'Làm Bánh Tráng Thủ Công: Nghề Truyền Thống Đang Hồi Sinh',
      excerpt: 'Đằng sau mỗi chiếc bánh tráng Nhà Na là đôi bàn tay khéo léo của những nghệ nhân bảo tồn nghề truyền thống hàng trăm năm tuổi.',
      content: `# Nghề Làm Bánh Tráng Thủ Công — Di Sản Sống Của Nha Trang

## Quy Trình Sản Xuất Truyền Thống

### 1. Chọn Gạo

Gạo ngon phải là gạo mùa vụ địa phương, không pha tẻ. Tỷ lệ pha thêm bột năng xác định độ dai và độ giòn của bánh.

### 2. Xay Bột

Xay ngâm qua đêm cho hạt gạo mềm đều. Bột xay phải mịn như kem, không có vón cục.

### 3. Tráng Bánh

Lửa vừa phải, khuôn hơi nóng đều. Múc một vá bột, đổ đều tay thành vòng tròn — kỹ thuật này mất vài tháng mới thành thục.

### 4. Phơi Nắng

Bánh vừa tráng xong được đặt trên vỉ tre và phơi dưới nắng 2-3 tiếng. Nắng tự nhiên tạo ra độ giòn đặc trưng mà lò sấy không thể thay thế.

## Hồi Sinh Nhờ Thị Trường Hiện Đại

Nhà Na là một trong số ít cơ sở duy trì hoàn toàn phương pháp thủ công, kết hợp với đóng gói hiện đại để đưa hương vị truyền thống đến khắp nơi.`,
      categoryName: 'Câu Chuyện Nha Trang',
      relatedProductIndices: [0, 9],
      status: 'published' as const,
    },
    {
      title: 'Combo Quà Tặng Nha Trang: Gửi Hương Vị Biển Đến Mọi Nơi',
      excerpt: 'Tìm kiếm quà tặng đặc sản cho người thân? Combo bánh tráng Nhà Na là lựa chọn hoàn hảo: ngon, đẹp, giá tốt và ý nghĩa.',
      content: `# Quà Tặng Nha Trang — Hơn Cả Món Ăn

## Tại Sao Chọn Bánh Tráng Làm Quà?

Bánh tráng Nha Trang không chỉ là thực phẩm — đó là ký ức. Ai đã từng đến Nha Trang đều nhớ những buổi chiều ăn bánh tráng nướng trên bãi biển hay những buổi tối cuốn bánh tráng thịt nướng bên gia đình.

## Combo Thượng Hạng Nhà Na

Hộp quà bao gồm:
- **Bánh tráng mỏng cuốn** (loại đặc biệt, 200g)
- **Bánh tráng nướng muối ớt** (ready-to-eat, 150g)
- **Bánh tráng trộn sate tôm** (ăn liền, 200g)
- **Nước chấm đặc biệt** (50ml)

Đóng gói trong hộp giấy cao cấp, có thể khắc tên theo yêu cầu.

## Bảo Quản và Vận Chuyển

- Hạn sử dụng: 3-6 tháng tùy loại
- Giao toàn quốc trong 2-3 ngày làm việc
- Đóng gói chân không, an toàn khi vận chuyển xa`,
      categoryName: 'Câu Chuyện Nha Trang',
      relatedProductIndices: [9, 10, 11],
      status: 'published' as const,
    },
    {
      title: 'Nước Mắm Nha Trang Trong Ẩm Thực Việt Nam',
      excerpt: 'Nước mắm Nha Trang được mệnh danh là "vàng lỏng" của ẩm thực Việt. Tìm hiểu vì sao nó lại đặc biệt và cách sử dụng đúng cách.',
      content: `# Nước Mắm Nha Trang — "Vàng Lỏng" Của Ẩm Thực Việt

## Đặc Điểm Nổi Bật

**Màu sắc**: Hổ phách đậm, trong vắt khi soi ánh nắng.
**Mùi**: Thơm nồng đặc trưng, không hắc, không tanh.
**Vị**: Mặn mà, hậu ngọt thanh — không cần nêm thêm bất cứ thứ gì.

## Quá Trình Ủ

Cá cơm tươi (đánh bắt trong ngày) được ủ muối theo tỷ lệ 3 cá : 1 muối. Thùng ủ bằng gỗ sao đen, để 12-18 tháng mới rút cốt nhĩ.

## Ứng Dụng Trong Bếp

- **Nước chấm**: Pha với chanh, tỏi, ớt, đường theo tỷ lệ.
- **Kho thịt**: Thay thế muối hoàn toàn für thịt kho.
- **Nấu phở**: Vài giọt vào bát phở tăng umami đặc biệt.
- **Bánh mì chấm mắm**: Thưởng thức nguyên chất — đặc sản mà chỉ người Nha Trang mới hiểu.`,
      categoryName: 'Câu Chuyện Nha Trang',
      relatedProductIndices: [10, 11],
      status: 'published' as const,
    },
  ];

  for (const post of posts) {
    const slug = slugify(post.title);
    const categoryId = catMap.get(post.categoryName);
    const relatedProductIds = post.relatedProductIndices.map((i) => pid(i)).filter(Boolean);

    await PostModel.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          title: post.title,
          slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: PLACEHOLDER_IMG(slug.substring(0, 20)),
          categoryId,
          relatedProductIds,
          status: post.status,
          publishedAt: new Date(),
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`📝 Post: ${post.title.substring(0, 50)}...`);
  }

  console.log('\n✅ Blog seeded successfully!');
  await disconnectDB();
}

seedBlog().catch((err) => {
  console.error('❌ seedBlog error:', err);
  process.exit(1);
});
