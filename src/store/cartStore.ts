/**
 * Cart Store
 *
 * Zustand store for cart management with persistence.
 */

import {create, StateCreator} from 'zustand';
import {persist, createJSONStorage, PersistOptions} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {CartItem, CartItemInput} from '@apptypes/cart';

interface CartState {
  items: CartItem[];

  // Actions
  addItem: (input: CartItemInput) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  clearCart: () => void;
}

/**
 * Derived selectors -- NOT stored in state, computed on read.
 * Exported as standalone selectors for granular subscriptions.
 */
export const selectSubtotal = (state: CartState): number =>
  state.items.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0,
  );

export const selectTotalItems = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartItemByVariant =
  (variantId: string) =>
  (state: CartState): CartItem | undefined =>
    state.items.find(item => item.variantId === variantId);

/**
 * Cart store state creator (without persist middleware).
 * Extracted for testing purposes.
 */
const cartStateCreator: StateCreator<CartState> = (set, get) => ({
  items: [],

  addItem: input =>
    set(state => {
      const existing = state.items.find(i => i.variantId === input.variantId);
      if (existing) {
        // Increment quantity of existing item
        return {
          items: state.items.map(i =>
            i.variantId === input.variantId
              ? {...i, quantity: i.quantity + 1}
              : i,
          ),
        };
      }
      // Add new item with quantity 1
      return {items: [...state.items, {...input, quantity: 1}]};
    }),

  removeItem: variantId =>
    set(state => ({
      items: state.items.filter(i => i.variantId !== variantId),
    })),

  updateQuantity: (variantId, delta) =>
    set(state => ({
      items: state.items
        .map(i =>
          i.variantId === variantId
            ? {...i, quantity: Math.max(0, i.quantity + delta)}
            : i,
        )
        .filter(i => i.quantity > 0), // Auto-remove when qty reaches 0
    })),

  clearCart: () => set({items: []}),
});

/**
 * Persist configuration
 */
type CartPersist = (
  config: StateCreator<CartState>,
  options: PersistOptions<CartState, Pick<CartState, 'items'>>,
) => StateCreator<CartState>;

const persistOptions: PersistOptions<CartState, Pick<CartState, 'items'>> = {
  name: 'cart-storage',
  storage: createJSONStorage(() => AsyncStorage),
  version: 1,
  // Migration: handle schema changes between versions
  migrate: (persistedState, version) => {
    if (version === 0) {
      // Example: migrate from v0 to v1 schema
      return {...(persistedState as CartState)};
    }
    return persistedState as CartState;
  },
  // Only persist items, not actions
  partialize: state => ({items: state.items}),
};

/**
 * Factory function for creating the store without persistence.
 * Used for testing to avoid AsyncStorage side effects.
 */
export const createCartStore = () => create<CartState>(cartStateCreator);

/**
 * Default singleton instance with persistence.
 */
export const useCartStore = create<CartState>()(
  (persist as CartPersist)(cartStateCreator, persistOptions),
);
