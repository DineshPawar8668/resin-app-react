export enum ProductType {
  REGULAR = 0,
  FEATURED = 1,
  DEAL_OF_THE_DAY = 2,
}

export interface ProductItem {
  id: string;
  image: string;
  title: string;
  description: string;
  price: number;
  discountpercent: number;
  offerprice: number;
  product_type: ProductType;
  category_id?: string;
  is_active: boolean;
  is_deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id?: string;
  id: string;
  name: string;
  description: string;
  image?: string;
  image_url?: string;
  is_active?: boolean;
  is_deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  category_id: string;
  images: string[];
  stock: number;
  is_featured: boolean;
  rating: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_profile?: UserProfile;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  address_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  address?: Address;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface FilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'popularity' | 'rating';
}
