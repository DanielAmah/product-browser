export const API_CONFIG = {
  PRODUCTS_URL:
    'https://gist.githubusercontent.com/agorovyi/40dcd166a38b4d1e9156ad66c87111b7/raw/36f1c815dd83ed8189e55e6e6619b5d7c7c4e7d6/testProducts.json',

  FETCH_TIMEOUT_MS: 10000,
  MAX_RETRIES: 2,

  PRODUCTS_CACHE_KEY: '@products_cache',
  CACHE_VERSION: 1,
} as const;
