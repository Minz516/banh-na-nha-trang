/**
 * seedCatalog.ts — seeds 4 categories and 12 products with real Vietnamese data.
 * Run with: pnpm seed:catalog
 * Idempotent: uses upsert by slug.
 */
import { connectDB, disconnectDB } from '../config/db.config.js';
import { CategoryModel, ProductModel } from '../modules/catalog/catalog.model.js';
import { slugify } from '../utils/slugify.js';

const PLACEHOLDER = (w: number, h: number) =>
  `https://picsum.photos/seed/${Math.floor(Math.random() * 999)}/${w}/${h}`;

const categories = [
  { name: 'Bánh Tráng Cuốn', description: 'Bánh tráng dùng để cuốn thịt, rau, hải sản — đặc sản Nha Trang', sortOrder: 1 },
  { name: 'Bánh Tráng Nướng', description: 'Bánh tráng nướng giòn rụm với nhiều topping hấp dẫn', sortOrder: 2 },
  { name: 'Bánh Tráng Trộn', description: 'Bánh tráng trộn sợi, ăn liền với nhiều hương vị', sortOrder: 3 },
  { name: 'Đặc Sản Nha Trang', description: 'Các đặc sản và quà tặng mang hương vị Nha Trang', sortOrder: 4 },
];

const productData = [
  // Cuốn
  {
    categoryName: 'Bánh Tráng Cuốn',
    name: 'Bánh Tráng Mỏng Cuốn Thịt Nướng',
    description: 'Bánh tráng mỏng đặc biệt, dùng cuốn thịt nướng, nem nướng hay hải sản. Độ dai vừa phải, không bị gãy khi cuốn.',
    basePrice: 45000,
    promoPrice: 38000,
    stock: 120,
    flavor: 'Tự nhiên',
    tags: ['cuốn', 'mỏng', 'thịt nướng'],
    isFeatured: true,
  },
  {
    categoryName: 'Bánh Tráng Cuốn',
    name: 'Bánh Tráng Dày Cuốn Hải Sản',
    description: 'Bánh tráng dày, chắc, thích hợp để cuốn hải sản tươi, tôm, mực. Xuất xứ Nha Trang, sản xuất thủ công.',
    basePrice: 55000,
    promoPrice: undefined,
    stock: 80,
    flavor: 'Tự nhiên',
    tags: ['cuốn', 'dày', 'hải sản'],
    isFeatured: false,
  },
  {
    categoryName: 'Bánh Tráng Cuốn',
    name: 'Bánh Tráng Gạo Lứt Cuốn Chay',
    description: 'Bánh tráng làm từ gạo lứt nguyên cám, phù hợp cho người ăn chay, ăn kiêng. Giàu chất xơ, thơm ngon.',
    basePrice: 60000,
    promoPrice: 50000,
    stock: 60,
    flavor: 'Gạo lứt',
    tags: ['cuốn', 'chay', 'gạo lứt', 'healthy'],
    isFeatured: true,
  },
  // Nướng
  {
    categoryName: 'Bánh Tráng Nướng',
    name: 'Bánh Tráng Nướng Muối Ớt Đặc Biệt',
    description: 'Bánh tráng nướng giòn, tẩm gia vị muối ớt Nha Trang đặc trưng. Vị cay nồng, mặn mà, ăn một cái muốn ăn thêm.',
    basePrice: 35000,
    promoPrice: 30000,
    stock: 200,
    flavor: 'Muối ớt',
    tags: ['nướng', 'muối ớt', 'giòn', 'snack'],
    isFeatured: true,
    isNewArrival: true,
  },
  {
    categoryName: 'Bánh Tráng Nướng',
    name: 'Bánh Tráng Nướng Phô Mai Tôm',
    description: 'Bánh tráng nướng phủ phô mai tan chảy và tôm khô rang giòn. Combo hoàn hảo giữa bánh giòn và topping thơm ngon.',
    basePrice: 45000,
    promoPrice: undefined,
    stock: 150,
    flavor: 'Phô mai tôm',
    tags: ['nướng', 'phô mai', 'tôm', 'snack'],
    isFeatured: false,
    isNewArrival: true,
  },
  {
    categoryName: 'Bánh Tráng Nướng',
    name: 'Bánh Tráng Nướng Than Hoa Tự Nhiên',
    description: 'Bánh tráng nướng trên than hoa, không có chất bảo quản. Vị khói nhẹ tự nhiên, giòn rụm cả ngày.',
    basePrice: 40000,
    promoPrice: 35000,
    stock: 100,
    flavor: 'Than hoa',
    tags: ['nướng', 'than hoa', 'tự nhiên', 'giòn'],
    isFeatured: false,
  },
  // Trộn
  {
    categoryName: 'Bánh Tráng Trộn',
    name: 'Bánh Tráng Trộn Sate Tôm Chua Cay',
    description: 'Bánh tráng sợi trộn sẵn với sate đặc biệt, tôm khô, gan heo và rau răm. Chua cay mặn ngọt đủ vị.',
    basePrice: 30000,
    promoPrice: 25000,
    stock: 300,
    flavor: 'Sate tôm',
    tags: ['trộn', 'sate', 'tôm', 'chua cay'],
    isFeatured: true,
  },
  {
    categoryName: 'Bánh Tráng Trộn',
    name: 'Bánh Tráng Trộn Bơ Tắc Đặc Biệt',
    description: 'Sự kết hợp độc đáo giữa bánh tráng sợi, bơ tươi béo ngậy và tắc chua dịu. Hương vị lạ miệng, ăn một lần nhớ mãi.',
    basePrice: 35000,
    promoPrice: undefined,
    stock: 250,
    flavor: 'Bơ tắc',
    tags: ['trộn', 'bơ', 'tắc', 'đặc biệt'],
    isFeatured: false,
    isNewArrival: true,
  },
  {
    categoryName: 'Bánh Tráng Trộn',
    name: 'Bánh Tráng Trộn Rong Biển Nha Trang',
    description: 'Bánh tráng trộn với rong biển tươi Nha Trang, giàu iốt và khoáng chất. Vị umami đặc trưng của biển cả.',
    basePrice: 40000,
    promoPrice: 33000,
    stock: 180,
    flavor: 'Rong biển',
    tags: ['trộn', 'rong biển', 'healthy', 'biển'],
    isFeatured: true,
  },
  // Đặc sản
  {
    categoryName: 'Đặc Sản Nha Trang',
    name: 'Combo Bánh Tráng Nhà Na Thượng Hạng',
    description: 'Hộp quà gồm 3 loại bánh tráng đặc sản: cuốn mỏng, nướng muối ớt và trộn sate. Đóng gói sang trọng, phù hợp làm quà tặng.',
    basePrice: 120000,
    promoPrice: 99000,
    stock: 50,
    flavor: undefined,
    tags: ['combo', 'quà tặng', 'đặc sản', 'thượng hạng'],
    isFeatured: true,
    isNewArrival: true,
  },
  {
    categoryName: 'Đặc Sản Nha Trang',
    name: 'Nước Mắm Nhĩ Nha Trang Thượng Hạng',
    description: 'Nước mắm nhĩ cốt nguyên chất, ủ cá cơm Nha Trang 2 năm. Màu hổ phách đẹp, độ đạm cao, thơm nồng đặc trưng.',
    basePrice: 85000,
    promoPrice: undefined,
    stock: 90,
    flavor: undefined,
    tags: ['nước mắm', 'đặc sản', 'gia vị', 'Nha Trang'],
    isFeatured: false,
  },
  {
    categoryName: 'Đặc Sản Nha Trang',
    name: 'Mực Rim Nha Trang Đóng Hộp',
    description: 'Mực tươi Nha Trang rim tỏi ớt, đóng hộp giữ nguyên hương vị. Bảo quản 12 tháng, không chất bảo quản nhân tạo.',
    basePrice: 95000,
    promoPrice: 80000,
    stock: 70,
    flavor: 'Tỏi ớt',
    tags: ['mực', 'rim', 'đặc sản', 'đóng hộp'],
    isFeatured: false,
    isNewArrival: true,
  },
];

async function seedCatalog(): Promise<void> {
  await connectDB();

  // Upsert categories
  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const slug = slugify(cat.name);
    const doc = await CategoryModel.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          name: cat.name,
          slug,
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
    categoryMap.set(cat.name, doc._id.toString());
    console.log(`📦 Category: ${cat.name}`);
  }

  // Upsert products
  for (const p of productData) {
    const categoryId = categoryMap.get(p.categoryName);
    if (!categoryId) continue;

    const slug = slugify(p.name);
    const imageUrl = PLACEHOLDER(800, 600);

    await ProductModel.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          name: p.name,
          slug,
          description: p.description,
          categoryId,
          flavor: p.flavor,
          images: [{ url: imageUrl, publicId: `seed/${slug}`, alt: p.name, width: 800, height: 600, sortOrder: 0 }],
          basePrice: p.basePrice,
          promoPrice: p.promoPrice,
          stock: p.stock,
          tags: p.tags,
          searchName: slug,
          isFeatured: p.isFeatured ?? false,
          isNewArrival: (p as { isNewArrival?: boolean }).isNewArrival ?? false,
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`🥠 Product: ${p.name}`);
  }

  console.log('\n✅ Catalog seeded successfully!');
  await disconnectDB();
}

seedCatalog().catch((err) => {
  console.error('❌ seedCatalog error:', err);
  process.exit(1);
});
