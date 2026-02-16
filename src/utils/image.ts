/**
 * Transform Shopify CDN URLs to request square crops.
 *
 * Shopify filenames embed `_WIDTHxHEIGHT` parameters (e.g. `_1180x400`).
 * We replace them with a square dimension so products render consistently.
 */
export function getSquareImageUrl(url: string, size = 600): string {
  return url.replace(/_\d+x\d+(?=\.\w+(\?|$))/, `_${size}x${size}`);
}
