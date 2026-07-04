import { api } from './authService';
import { CartInstanceDetail, CartItem, Product } from '../types';
import { getImageUrl } from '../lib/imageUrl';

export interface AddToCartDetails {
  date: string;
  description: string;
  images: File[];
}

const normalizeInstanceDetail = (d: any): CartInstanceDetail => ({
  date: d.date ?? '',
  description: d.description ?? '',
  images: Array.isArray(d.images) ? d.images.map((img: string) => getImageUrl(img)) : [],
});

const normalizeProduct = (p: any): Product => ({
  id: p._id ?? p.id ?? '',
  name: p.title ?? '',
  description: p.description ?? '',
  price: p.price ?? 0,
  discount_price: p.offerprice,
  category_id: p.categoryid ?? '',
  images: p.image ? [getImageUrl(p.image)] : [],
  stock: p.stock ?? 999,
  is_featured: p.product_type === 1,
  rating: 0,
  created_at: p.createdAt ?? '',
  updated_at: p.updatedAt ?? '',
});

const normalizeItem = (item: any): CartItem => {
  const prod = item.productid && typeof item.productid === 'object' ? item.productid : null;
  return {
    id: item._id ?? item.id ?? '',
    user_id: typeof item.customerid === 'string' ? item.customerid : (item.customerid?._id ?? ''),
    product_id: prod?._id ?? item.productid ?? '',
    quantity: item.quantity ?? 1,
    instanceDetails: Array.isArray(item.instanceDetails) ? item.instanceDetails.map(normalizeInstanceDetail) : [],
    created_at: item.createdAt ?? '',
    updated_at: item.updatedAt ?? '',
    product: prod ? normalizeProduct(prod) : undefined,
  };
};

export const cartService = {
  async getCartItems(customerId: string): Promise<CartItem[]> {
    const { data } = await api.get(`/cart/customer/${customerId}`);
    const items: any[] = data?.data?.data ?? data?.data ?? [];
    return items.map(normalizeItem);
  },

  async addToCart(customerId: string, productId: string, details: AddToCartDetails): Promise<CartItem> {
    const formData = new FormData();
    formData.append('customerid', customerId);
    formData.append('productid', productId);
    formData.append('date', details.date);
    formData.append('description', details.description);
    details.images.forEach((file) => formData.append('images', file));

    const { data } = await api.post('/cart', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeItem(data?.data ?? data);
  },

  async removeInstance(itemId: string, index: number): Promise<void> {
    await api.delete(`/cart/${itemId}/instance/${index}`);
  },

  async removeFromCart(itemId: string): Promise<void> {
    await api.delete(`/cart/${itemId}`);
  },

  async clearCart(customerId: string): Promise<void> {
    await api.delete(`/cart/customer/${customerId}/clear`);
  },

  async placeOrder(customerId: string, productIds: string[]): Promise<any> {
    const { data } = await api.post('/orders', {
      customerid: customerId,
      productsids: productIds,
    });
    return data?.data ?? data;
  },
};
