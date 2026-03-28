import { supabase } from '../lib/supabase';
import { WishlistItem } from '../types';

export const wishlistService = {
  async getWishlist(userId: string) {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*, product:products(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as WishlistItem[];
  },

  async addToWishlist(userId: string, productId: string) {
    const { data, error } = await supabase
      .from('wishlists')
      .insert({ user_id: userId, product_id: productId })
      .select('*, product:products(*)')
      .single();

    if (error) throw error;
    return data as WishlistItem;
  },

  async removeFromWishlist(itemId: string) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },
};
