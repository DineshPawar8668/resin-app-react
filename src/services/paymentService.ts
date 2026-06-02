import { api } from './authService';

export interface InitiatePaymentResponse {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open(): void;
}

export const paymentService = {
  async initiatePayment(customerid: string, products: { product_id: string; quantity: number }[]): Promise<InitiatePaymentResponse> {
    const { data } = await api.post('/payments/initiate', { customerid, products });
    return data?.data ?? data;
  },

  async verifyPayment(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    customerid: string,
    products: { product_id: string; quantity: number }[],
    shippingAddress?: Record<string, any>,
  ): Promise<any> {
    const { data } = await api.post('/payments/verify', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerid,
      products,
      shippingAddress,
    });
    return data?.data ?? data;
  },

  openCheckout(
    options: InitiatePaymentResponse,
    customerName: string,
    customerEmail: string,
    onSuccess: (response: RazorpaySuccessResponse) => void,
    onDismiss?: () => void
  ) {
    const rzp = new window.Razorpay({
      key: options.key_id,
      amount: options.amount,
      currency: options.currency,
      name: 'Resin Art Store',
      description: 'Handmade Resin Products',
      order_id: options.razorpay_order_id,
      handler: onSuccess,
      prefill: {
        name: customerName,
        email: customerEmail,
      },
      theme: { color: '#F06292' },
      modal: { ondismiss: onDismiss },
    });
    rzp.open();
  },
};
