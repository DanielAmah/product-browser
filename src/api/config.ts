/**
 * API Configuration
 *
 * Centralized configuration for API endpoints and settings.
 */

export const API_CONFIG = {
  /** Product feed URL */
  PRODUCTS_URL:
    'https://gist.githubusercontent.com/agorovyi/40dcd166a38b4d1e9156ad66c87111b7/raw/36f1c815dd83ed8189e55e6e6619b5d7c7c4e7d6/testProducts.json',

  /** Request timeout in milliseconds */
  FETCH_TIMEOUT_MS: 10000,

  /** Maximum retry attempts */
  MAX_RETRIES: 2,

  /** Cache key for products */
  PRODUCTS_CACHE_KEY: '@products_cache',

  /** Cache schema version (for migrations) */
  CACHE_VERSION: 1,
} as const;
