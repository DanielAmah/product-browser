/**
 * Image Utilities
 *
 * Helpers for transforming Shopify CDN image URLs.
 */

/**
 * Transform Shopify CDN image URLs to request square crops.
 *
 * Shopify filenames often embed `_WIDTHxHEIGHT` resize parameters
 * (e.g. `_1180x400`). This replaces them with a square dimension so
 * products aren't served as landscape crops.
 *
 * @param url  - Original Shopify CDN image URL
 * @param size - Desired square dimension in pixels (default 600)
 */
export function getSquareImageUrl(url: string, size = 600): string {
  return url.replace(/_\d+x\d+(?=\.\w+(\?|$))/, `_${size}x${size}`);
}
