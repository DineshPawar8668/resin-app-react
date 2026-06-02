import { api } from './authService';

export interface OrderReview {
  _id: string;
  Customername: string;
  ratings: number;
  description: string;
  orderid: string;
  customerid: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const orderReviewService = {
  async getAll(limit = 6): Promise<OrderReview[]> {
    const { data } = await api.get(`/reviews?limit=${limit}`);
    return data?.data ?? [];
  },

  async getByOrderId(orderId: string): Promise<OrderReview | null> {
    const { data } = await api.get(`/reviews/order/${orderId}`);
    return data?.data ?? null;
  },

  async submit(payload: {
    orderid: string;
    customerid: string;
    Customername: string;
    ratings: number;
    description: string;
  }): Promise<OrderReview> {
    const { data } = await api.post('/reviews/upsert', payload);
    return data?.data;
  },
};
