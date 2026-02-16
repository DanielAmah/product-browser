/**
 * Cart items are denormalized snapshots — they store the price and title at the
 * time of adding. If the feed updates prices while items sit in the cart, the
 * user still sees what they added. A production app would reconcile on checkout.
 */

import type {Money, ProductImage, SelectedOption} from './product';

export interface CartItem {
  variantId: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  price: Money;
  quantity: number;
  image: ProductImage;
  selectedOptions: SelectedOption[];
}

/** Input for addItem — quantity is always 1 on add; store handles increment. */
export type CartItemInput = Omit<CartItem, 'quantity'>;
