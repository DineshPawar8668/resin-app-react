import { api } from './authService';

export interface ProductReview {
  _id: string;
  product_id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductReviewsResponse {
  reviews: ProductReview[];
  avgRating: number;
  total: number;
}

export const productReviewService = {
  async getByProduct(productId: string): Promise<ProductReviewsResponse> {
    const { data } = await api.get(`/product-reviews/${productId}`);
    const payload = data?.data ?? {};
    return {
      reviews: payload.reviews ?? [],
      avgRating: payload.avgRating ?? 0,
      total: payload.total ?? 0,
    };
  },

  async create(body: { product_id: string; name: string; rating: number; comment: string }): Promise<ProductReview> {
    const { data } = await api.post('/product-reviews', body);
    return data?.data;
  },
};
