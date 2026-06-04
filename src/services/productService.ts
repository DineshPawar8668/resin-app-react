import { api } from './authService';
import { getImageUrl } from '../lib/imageUrl';
import { ProductItem, ProductType, Product, Category } from '../types';

const normalize = (raw: Record<string, any>): ProductItem => ({
  id: raw._id ?? raw.id ?? '',
  image: getImageUrl(raw.image),
  title: raw.title ?? raw.name ?? '',
  description: raw.description ?? '',
  price: Number(raw.price) || 0,
  discountpercent: Number(raw.discountpercent) || 0,
  offerprice: Number(raw.offerprice) || Number(raw.price) || 0,
  product_type: (raw.product_type as ProductType) ?? ProductType.REGULAR,
  category_id: raw.category_id ?? raw.category?._id ?? raw.category?.id ?? '',
  is_active: raw.is_active ?? true,
  is_deleted: raw.is_deleted ?? false,
  avgRating: Number(raw.avgRating) || 0,
  totalReviews: Number(raw.totalReviews) || 0,
  createdAt: raw.createdAt ?? raw.created_at ?? '',
  updatedAt: raw.updatedAt ?? raw.updated_at ?? '',
});

const toLegacyProduct = (item: ProductItem): Product => ({
  id: item.id,
  name: item.title,
  description: item.description,
  price: item.price,
  discount_price: item.discountpercent > 0 ? item.offerprice : undefined,
  category_id: item.category_id ?? '',
  images: item.image ? [item.image] : [],
  stock: 0,
  is_featured: item.product_type === ProductType.FEATURED,
  rating: item.avgRating ?? 0,
  totalReviews: item.totalReviews ?? 0,
  created_at: item.createdAt ?? '',
  updated_at: item.updatedAt ?? '',
});

const multipart = { 'Content-Type': 'multipart/form-data' };
const list = (data: any): any[] => data?.data ?? data?.products ?? (Array.isArray(data) ? data : []);
const single = (data: any): any => data?.data ?? data?.product ?? data;

export interface ProductPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductsPage {
  products: Product[];
  pagination: ProductPagination;
}

export const productService = {
  async getAll(params?: Record<string, any>): Promise<ProductItem[]> {
    const { data } = await api.get('/products', { params });
    return list(data).map(normalize);
  },

  async getProductsPaginated(params: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: string | string[];
    min_price?: number;
    max_price?: number;
    only_discount?: boolean;
    sort?: string;
  }): Promise<ProductsPage> {
    // Send array of category ids as comma-separated string
    const queryParams: Record<string, any> = { ...params };
    if (Array.isArray(params.category_id)) {
      queryParams.category_id = params.category_id.join(',');
    }
    const { data } = await api.get('/products', { params: queryParams });
    const items: any[] = data?.data ?? [];
    return {
      products: items.map(normalize).map(toLegacyProduct),
      pagination: data?.pagination ?? {
        total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false,
      },
    };
  },

  async getById(id: string): Promise<ProductItem> {
    const { data } = await api.get(`/products/${id}`);
    return normalize(single(data));
  },

  async create(formData: FormData): Promise<ProductItem> {
    const { data } = await api.post('/products', formData, { headers: multipart });
    return normalize(single(data));
  },

  async update(id: string, formData: FormData): Promise<ProductItem> {
    const { data } = await api.put(`/products/${id}`, formData, { headers: multipart });
    return normalize(single(data));
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async toggleActive(id: string): Promise<ProductItem> {
    const { data } = await api.patch(`/products/${id}/toggle-active`);
    return normalize(single(data));
  },

  async getFeatured(): Promise<ProductItem[]> {
    const { data } = await api.get('/products/featured');
    return list(data).map(normalize);
  },

  async getDeals(): Promise<ProductItem[]> {
    const { data } = await api.get('/products/deals');
    return list(data).map(normalize);
  },

  // --- Legacy compat for existing user-facing pages ---
  async getProducts(): Promise<Product[]> {
    const items = await this.getAll();
    return items.map(toLegacyProduct);
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      return toLegacyProduct(await this.getById(id));
    } catch {
      return null;
    }
  },

  async getCategories(): Promise<Category[]> {
    const { categoryService } = await import('./categoryService');
    return (await categoryService.getAll()) as unknown as Category[];
  },
};
