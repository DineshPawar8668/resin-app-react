import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../../types';

interface CartState {
  items: CartItem[];
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  loading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingIndex = state.items.findIndex(
        item => item.product_id === action.payload.product_id
      );
      if (existingIndex !== -1) {
        state.items[existingIndex] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },
    removeCartInstance: (
      state,
      action: PayloadAction<{ id: string; index: number }>
    ) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (!item) return;
      if (item.instanceDetails.length <= 1) {
        state.items = state.items.filter(i => i.id !== action.payload.id);
        return;
      }
      item.instanceDetails.splice(action.payload.index, 1);
      item.quantity = item.instanceDetails.length;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setCartItems,
  addToCart,
  removeCartInstance,
  removeFromCart,
  clearCart,
  setLoading,
} = cartSlice.actions;

export default cartSlice.reducer;
