import { api } from './authService';
import { getImageUrl, getVideoUrl } from '../lib/imageUrl';
import { ProductItem, ProductType, Product, Category } from '../types';

const normalize = (raw: Record<string, any>): ProductItem => {
  // Build images array: prefer raw.images[], fall back to raw.image
  const rawImages: string[] = Array.isArray(raw.images) && raw.images.length
    ? raw.images
    : (raw.image ? [raw.image] : []);

  return {
    id: raw._id ?? raw.id ?? '',
    image: getImageUrl(rawImages[0] ?? raw.image),
    images: rawImages.map((img) => getImageUrl(img)),
    imagePublicIds: rawImages,               // keep raw public_ids for the edit form
    video: raw.video ? getVideoUrl(raw.video) : undefined,
    videoPublicId: raw.video || undefined,   // raw public_id for the edit form
    title: raw.title ?? raw.name ?? '',
    description: raw.description ?? '',
    price: Number(raw.price) || 0,
    discountpercent: Number(raw.discountpercent) || 0,
    offerprice: Number(raw.offerprice) || Number(raw.price) || 0,
    product_type: (raw.product_type as ProductType) ?? ProductType.REGULAR,
    category_id: raw.category_id ?? raw.category?._id ?? raw.category?.id ?? '',
    parent_product_id: raw.parent_product_id ?? undefined,
    size: raw.size || undefined,
    is_active: raw.is_active ?? true,
    is_deleted: raw.is_deleted ?? false,
    avgRating: Number(raw.avgRating) || 0,
    totalReviews: Number(raw.totalReviews) || 0,
    createdAt: raw.createdAt ?? raw.created_at ?? '',
    updatedAt: raw.updatedAt ?? raw.updated_at ?? '',
  };
};

const toLegacyProduct = (item: ProductItem): Product => ({
  id: item.id,
  name: item.title,
  description: item.description,
  price: item.price,
  discount_price: item.discountpercent > 0 ? item.offerprice : undefined,
  category_id: item.category_id ?? '',
  images: item.images.length ? item.images : (item.image ? [item.image] : []),
  stock: 0,
  is_featured: item.product_type === ProductType.FEATURED,
  rating: item.avgRating ?? 0,
  totalReviews: item.totalReviews ?? 0,
  created_at: item.createdAt ?? '',
  updated_at: item.updatedAt ?? '',
  size: item.size,
  parent_product_id: item.parent_product_id,
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

  // Pre-uploads a video ahead of the product save request so the save call stays fast.
  // Returns the Cloudinary public_id to send back in the create/update payload.
  async uploadVideo(file: File, onProgress?: (percent: number) => void): Promise<string> {
    const fd = new FormData();
    fd.append('video', file);
    const { data } = await api.post('/products/upload-video', fd, {
      headers: multipart,
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      },
    });
    return single(data)?.publicId;
  },

  // Cleans up a pre-uploaded video that was never attached to a saved product
  // (e.g. the admin swapped it for a different file or removed it before submitting).
  async deleteUploadedVideo(publicId: string): Promise<void> {
    if (!publicId) return;
    await api.post('/products/upload-video/delete', { publicId });
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

  async getProductById(id: string): Promise<ProductItem | null> {
    try {
      return await this.getById(id);
    } catch {
      return null;
    }
  },

  async getCategories(): Promise<Category[]> {
    const { categoryService } = await import('./categoryService');
    return (await categoryService.getAll()) as unknown as Category[];
  },

  async createWithSizes(formData: FormData): Promise<ProductItem[]> {
    const { data } = await api.post('/products/create-with-sizes', formData, { headers: multipart });
    const items = data?.data;
    return Array.isArray(items) ? items.map(normalize) : [normalize(items)];
  },

  async getSizeVariants(id: string): Promise<Array<{ id: string; size: string; price: number; discountpercent: number; offerprice: number }>> {
    const { data } = await api.get(`/products/${id}/sizes`);
    return data?.data ?? [];
  },
};
