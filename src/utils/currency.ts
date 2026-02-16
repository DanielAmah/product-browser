import type {Money} from '@apptypes/product';

export function parseMoney(money: Money): number {
  return parseFloat(money.amount);
}

/** @example formatPrice({ amount: "28.96", currencyCode: "CAD" }) => "$28.96 CAD" */
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
 * VoiceOver/TalkBack-friendly price string.
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
 * True when compareAtPrice is present, non-zero, and strictly greater than
 * the current price (i.e. an actual discount, not just stale metadata).
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
  if (currentPrice) {
    return compareAmount > parseMoney(currentPrice);
  }
  return true;
}

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
