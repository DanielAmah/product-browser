/**
 * Cart Store Tests
 *
 * Note: The store's addItem function takes CartItemInput (without quantity)
 * and always adds with quantity=1 or increments by 1 if existing.
 */

import {act} from '@testing-library/react-native';
import {
  useCartStore,
  selectSubtotal,
  selectTotalItems,
  selectCartItemByVariant,
} from '../../store/cartStore';
import type {CartItemInput} from '../../types/cart';

// Reset store before each test
beforeEach(() => {
  useCartStore.setState({items: []});
});

describe('cartStore', () => {
  describe('addItem', () => {
    it('adds a new item to the cart with quantity 1', () => {
      const input: CartItemInput = {
        variantId: 'v1',
        productId: 'p1',
        title: 'Test Product',
        variantTitle: 'Size S',
        price: {amount: '28.96', currencyCode: 'CAD'},
        image: {id: 'img1', url: 'https://example.com/image.jpg'},
      };

      act(() => {
        useCartStore.getState().addItem(input);
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].variantId).toBe('v1');
      expect(state.items[0].quantity).toBe(1);
    });

    it('increments quantity for existing item', () => {
      const input: CartItemInput = {
        variantId: 'v1',
        productId: 'p1',
        title: 'Test Product',
        variantTitle: 'Size S',
        price: {amount: '28.96', currencyCode: 'CAD'},
        image: {id: 'img1', url: 'https://example.com/image.jpg'},
      };

      act(() => {
        useCartStore.getState().addItem(input);
        useCartStore.getState().addItem(input);
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
    });

    it('adds multiple different items', () => {
      const input1: CartItemInput = {
        variantId: 'v1',
        productId: 'p1',
        title: 'Product 1',
        variantTitle: 'Size S',
        price: {amount: '28.96', currencyCode: 'CAD'},
        image: null,
      };

      const input2: CartItemInput = {
        variantId: 'v2',
        productId: 'p2',
        title: 'Product 2',
        variantTitle: 'Size M',
        price: {amount: '45.00', currencyCode: 'CAD'},
        image: null,
      };

      act(() => {
        useCartStore.getState().addItem(input1);
        useCartStore.getState().addItem(input2);
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('removes an item from the cart', () => {
      const input: CartItemInput = {
        variantId: 'v1',
        productId: 'p1',
        title: 'Test Product',
        variantTitle: 'Size S',
        price: {amount: '28.96', currencyCode: 'CAD'},
        image: null,
      };

      act(() => {
        useCartStore.getState().addItem(input);
        useCartStore.getState().removeItem('v1');
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('does nothing when removing non-existent item', () => {
      act(() => {
        useCartStore.getState().removeItem('non-existent');
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });
  });

  describe('updateQuantity', () => {
    it('increases quantity by delta', () => {
      const input: CartItemInput = {
        variantId: 'v1',
        productId: 'p1',
        title: 'Test Product',
        variantTitle: 'Size S',
        price: {amount: '28.96', currencyCode: 'CAD'},
        image: null,
      };

      act(() => {
        useCartStore.getState().addItem(input);
        useCartStore.getState().updateQuantity('v1', 2);
      });

      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(3); // 1 + 2
    });

    it('decreases quantity by delta', () => {
      const input: CartItemInput = {
        variantId: 'v1',
        productId: 'p1',
        title: 'Test Product',
        variantTitle: 'Size S',
        price: {amount: '28.96', currencyCode: 'CAD'},
        image: null,
      };

      act(() => {
        // Add 3 times to get quantity=3
        useCartStore.getState().addItem(input);
        useCartStore.getState().addItem(input);
        useCartStore.getState().addItem(input);
        useCartStore.getState().updateQuantity('v1', -1);
      });

      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(2); // 3 - 1
    });

    it('removes item when quantity reaches zero', () => {
      const input: CartItemInput = {
        variantId: 'v1',
        productId: 'p1',
        title: 'Test Product',
        variantTitle: 'Size S',
        price: {amount: '28.96', currencyCode: 'CAD'},
        image: null,
      };

      act(() => {
        useCartStore.getState().addItem(input);
        useCartStore.getState().updateQuantity('v1', -1);
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('removes item when quantity goes negative', () => {
      const input: CartItemInput = {
        variantId: 'v1',
        productId: 'p1',
        title: 'Test Product',
        variantTitle: 'Size S',
        price: {amount: '28.96', currencyCode: 'CAD'},
        image: null,
      };

      act(() => {
        useCartStore.getState().addItem(input);
        useCartStore.getState().updateQuantity('v1', -5);
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('removes all items from cart', () => {
      const input1: CartItemInput = {
        variantId: 'v1',
        productId: 'p1',
        title: 'Product 1',
        variantTitle: 'Size S',
        price: {amount: '28.96', currencyCode: 'CAD'},
        image: null,
      };

      const input2: CartItemInput = {
        variantId: 'v2',
        productId: 'p2',
        title: 'Product 2',
        variantTitle: 'Size M',
        price: {amount: '45.00', currencyCode: 'CAD'},
        image: null,
      };

      act(() => {
        useCartStore.getState().addItem(input1);
        useCartStore.getState().addItem(input2);
        useCartStore.getState().clearCart();
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });
  });

  describe('selectors', () => {
    describe('selectSubtotal', () => {
      it('calculates subtotal correctly', () => {
        const input1: CartItemInput = {
          variantId: 'v1',
          productId: 'p1',
          title: 'Product 1',
          variantTitle: 'Size S',
          price: {amount: '10.00', currencyCode: 'CAD'},
          image: null,
        };

        const input2: CartItemInput = {
          variantId: 'v2',
          productId: 'p2',
          title: 'Product 2',
          variantTitle: 'Size M',
          price: {amount: '25.00', currencyCode: 'CAD'},
          image: null,
        };

        act(() => {
          // Add item1 twice (qty=2) and item2 once (qty=1)
          useCartStore.getState().addItem(input1);
          useCartStore.getState().addItem(input1);
          useCartStore.getState().addItem(input2);
        });

        const state = useCartStore.getState();
        const subtotal = selectSubtotal(state);
        expect(subtotal).toBe(45.0); // (10 * 2) + (25 * 1)
      });

      it('returns 0 for empty cart', () => {
        const state = useCartStore.getState();
        const subtotal = selectSubtotal(state);
        expect(subtotal).toBe(0);
      });
    });

    describe('selectTotalItems', () => {
      it('counts total items correctly', () => {
        const input1: CartItemInput = {
          variantId: 'v1',
          productId: 'p1',
          title: 'Product 1',
          variantTitle: 'Size S',
          price: {amount: '10.00', currencyCode: 'CAD'},
          image: null,
        };

        const input2: CartItemInput = {
          variantId: 'v2',
          productId: 'p2',
          title: 'Product 2',
          variantTitle: 'Size M',
          price: {amount: '25.00', currencyCode: 'CAD'},
          image: null,
        };

        act(() => {
          // Add item1 twice (qty=2) and item2 three times (qty=3)
          useCartStore.getState().addItem(input1);
          useCartStore.getState().addItem(input1);
          useCartStore.getState().addItem(input2);
          useCartStore.getState().addItem(input2);
          useCartStore.getState().addItem(input2);
        });

        const state = useCartStore.getState();
        const total = selectTotalItems(state);
        expect(total).toBe(5); // 2 + 3
      });

      it('returns 0 for empty cart', () => {
        const state = useCartStore.getState();
        const total = selectTotalItems(state);
        expect(total).toBe(0);
      });
    });

    describe('selectCartItemByVariant', () => {
      it('finds item by variant id', () => {
        const input: CartItemInput = {
          variantId: 'v1',
          productId: 'p1',
          title: 'Test Product',
          variantTitle: 'Size S',
          price: {amount: '28.96', currencyCode: 'CAD'},
          image: null,
        };

        act(() => {
          useCartStore.getState().addItem(input);
        });

        const state = useCartStore.getState();
        const found = selectCartItemByVariant('v1')(state);
        expect(found?.variantId).toBe('v1');
      });

      it('returns undefined for non-existent variant', () => {
        const state = useCartStore.getState();
        const found = selectCartItemByVariant('non-existent')(state);
        expect(found).toBeUndefined();
      });
    });
  });
});
