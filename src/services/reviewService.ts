import { supabase } from '../lib/supabase';
import { Review } from '../types';

export const reviewService = {
  async getProductReviews(productId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, user_profile:user_profiles(*)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Review[];
  },

  async createReview(productId: string, userId: string, rating: number, comment: string) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({ product_id: productId, user_id: userId, rating, comment })
      .select('*, user_profile:user_profiles(*)')
      .single();

    if (error) throw error;
    return data as Review;
  },

  async updateReview(reviewId: string, rating: number, comment: string) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ rating, comment })
      .eq('id', reviewId)
      .select('*, user_profile:user_profiles(*)')
      .single();

    if (error) throw error;
    return data as Review;
  },

  async deleteReview(reviewId: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  },
};
