import type { ICart } from './cart.model.js';
import type { IProduct } from '../catalog/catalog.model.js';

export const CartDTO = {
  cartResponse(cart: ICart, products: IProduct[]) {
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const items = cart.items.map((item) => {
      const product = productMap.get(item.productId.toString());
      return {
        id: item._id.toString(),
        productId: item.productId.toString(),
        quantity: item.quantity,
        addedAt: item.addedAt.toISOString(),
        product: product
          ? {
              name: product.name,
              slug: product.slug,
              price: product.promoPrice ?? product.basePrice,
              imageUrl: product.images[0]?.url ?? null,
            }
          : null,
      };
    });
    const totalItems = items.reduce((s, i) => s + i.quantity, 0);
    const totalAmount = items.reduce((s, i) => {
      const product = productMap.get(i.productId);
      return s + (product ? (product.promoPrice ?? product.basePrice) * i.quantity : 0);
    }, 0);
    return { items, totalItems, totalAmount };
  },
};
