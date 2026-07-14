import { api } from './authService';
import { getImageUrl } from '../lib/imageUrl';

export interface ProductReview {
  _id: string;
  product_id: string;
  name: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

export interface ProductReviewsResponse {
  reviews: ProductReview[];
  avgRating: number;
  total: number;
}

const normalizeReview = (raw: Record<string, any>): ProductReview => ({
  _id: raw._id,
  product_id: raw.product_id,
  name: raw.name,
  rating: raw.rating,
  comment: raw.comment ?? '',
  images: Array.isArray(raw.images) ? raw.images.map((img: string) => getImageUrl(img)) : [],
  createdAt: raw.createdAt,
});

export const productReviewService = {
  async getByProduct(productId: string): Promise<ProductReviewsResponse> {
    const { data } = await api.get(`/product-reviews/${productId}`);
    const payload = data?.data ?? {};
    return {
      reviews: (payload.reviews ?? []).map(normalizeReview),
      avgRating: payload.avgRating ?? 0,
      total: payload.total ?? 0,
    };
  },

  async create(body: { product_id: string; name: string; rating: number; comment: string; images?: File[] }): Promise<ProductReview> {
    const fd = new FormData();
    fd.append('product_id', body.product_id);
    fd.append('name', body.name);
    fd.append('rating', String(body.rating));
    fd.append('comment', body.comment);
    body.images?.forEach((file) => fd.append('images', file));

    const { data } = await api.post('/product-reviews', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeReview(data?.data);
  },
};
