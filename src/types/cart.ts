/**
 * Cart Domain Types
 *
 * Cart items are denormalized snapshots -- they store the price and title at the time of adding.
 * This is intentional: if the feed updates prices while items are in the cart, the user sees
 * what they added, not a silently changed price. A production app would reconcile on checkout.
 */

import type {Money, ProductImage, SelectedOption} from './product';

export interface CartItem {
  variantId: string;
  productId: string;
  productTitle: string;
  variantTitle: string; // "Black / S"
  price: Money; // snapshot at time of add
  quantity: number;
  image: ProductImage;
  selectedOptions: SelectedOption[];
}

/**
 * Used for addItem action -- quantity is always 1 on add, store handles increment
 */
export type CartItemInput = Omit<CartItem, 'quantity'>;
