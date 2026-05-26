import { api } from "./authService";
import { getImageUrl } from "../lib/imageUrl";

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderProduct {
  id: string;
  title: string;
  price: number;
  offerprice: number;
  image: string;
}

export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
}

export interface OrderItem {
  id: string;
  status: OrderStatus;
  ispayment: boolean;
  totalprice: number;
  notes: string;
  products: OrderProduct[];
  customer: OrderCustomer | null;
  productsRawInfo: any[];
  createdAt: string;
  updatedAt: string;
}

const normalizeProduct = (p: any): OrderProduct => ({
  id: p._id ?? p.id ?? "",
  title: p.title ?? p.name ?? "",
  price: p.price ?? 0,
  offerprice: p.offerprice ?? p.price ?? 0,
  image: getImageUrl(p.image ?? ""),
});

const normalizeCustomer = (c: any): OrderCustomer | null => {
  if (!c || typeof c === "string") return null;
  return {
    id: c._id ?? c.id ?? "",
    name: c.name ?? "",
    email: c.email ?? "",
  };
};

const normalize = (raw: any): OrderItem => ({
  id: raw._id ?? raw.id ?? "",
  status: raw.status ?? "pending",
  ispayment: raw.ispayment ?? false,
  totalprice: raw.totalprice ?? 0,
  notes: raw.notes ?? "",
  products: Array.isArray(raw.productsids)
    ? raw.productsids.map((p: any) => (typeof p === "object" ? normalizeProduct(p) : { id: p, title: "", price: 0, offerprice: 0, image: "" }))
    : [],
  customer: normalizeCustomer(raw.customerid),
  productsRawInfo: raw?.productsRawInfo,
  createdAt: raw.createdAt ?? "",
  updatedAt: raw.updatedAt ?? "",
});

export const orderService = {
  async getAll(page = 1, limit = 20): Promise<{ orders: OrderItem[]; total: number; totalPages: number }> {
    const { data } = await api.get("/orders", { params: { page, limit } });
    return {
      orders: (data?.data ?? []).map(normalize),
      total: data?.pagination?.total ?? 0,
      totalPages: data?.pagination?.totalPages ?? 1,
    };
  },

  async getByCustomer(customerId: string, page = 1, limit = 20): Promise<{ orders: OrderItem[]; total: number }> {
    const { data } = await api.get(`/orders/customer/${customerId}`, { params: { page, limit } });
    return {
      orders: (data?.data ?? []).map(normalize),
      total: data?.pagination?.total ?? 0,
    };
  },

  async getById(id: string): Promise<OrderItem> {
    const { data } = await api.get(`/orders/${id}`);
    return normalize(data?.data ?? data);
  },

  async updateStatus(id: string, status: OrderStatus): Promise<OrderItem> {
    const { data } = await api.patch(`/orders/${id}/status`, { status });
    return normalize(data?.data ?? data);
  },

  async updatePayment(id: string, ispayment: boolean): Promise<OrderItem> {
    const { data } = await api.patch(`/orders/${id}/payment`, { ispayment });
    return normalize(data?.data ?? data);
  },
};
