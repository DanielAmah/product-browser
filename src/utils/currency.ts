/**
 * Currency Utilities
 *
 * Functions for parsing, formatting, and comparing prices.
 */

import type {Money} from '@apptypes/product';

/**
 * Parse a Money amount to a number.
 */
export function parseMoney(money: Money): number {
  return parseFloat(money.amount);
}

/**
 * Format a Money value for display.
 *
 * @example formatPrice({ amount: "28.96", currencyCode: "CAD" }) => "$28.96 CAD"
 */
export function formatPrice(money: Money): string {
  const amount = parseMoney(money);
  const formatted = amount.toLocaleString('en-CA', {
    style: 'currency',
    currency: money.currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${money.currencyCode}`;
}

/**
 * Format a Money value for VoiceOver/TalkBack.
 * Reads as "28 dollars and 96 cents Canadian" instead of "$28.96 CAD".
 */
export function formatPriceForVoiceOver(money: Money): string {
  const amount = parseMoney(money);
  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);

  const currencyName =
    money.currencyCode === 'CAD' ? 'Canadian' : money.currencyCode;

  if (cents === 0) {
    return `${dollars} dollars ${currencyName}`;
  }
  return `${dollars} dollars and ${cents} cents ${currencyName}`;
}

/**
 * Check if a compareAtPrice indicates a genuine sale.
 * Returns true only when compareAtPrice is present, non-zero,
 * and strictly greater than the current price.
 */
export function isOnSale(
  compareAtPrice: Money | null,
  currentPrice?: Money,
): boolean {
  if (!compareAtPrice) {
    return false;
  }
  const compareAmount = parseMoney(compareAtPrice);
  if (compareAmount <= 0) {
    return false;
  }
  // When a current price is provided, only flag as sale if there's an actual discount
  if (currentPrice) {
    return compareAmount > parseMoney(currentPrice);
  }
  return true;
}

/**
 * Calculate the discount percentage between two prices.
 */
export function calculateDiscountPercentage(
  originalPrice: Money,
  salePrice: Money,
): number {
  const original = parseMoney(originalPrice);
  const sale = parseMoney(salePrice);

  if (original <= 0) {
    return 0;
  }

  return Math.round(((original - sale) / original) * 100);
}