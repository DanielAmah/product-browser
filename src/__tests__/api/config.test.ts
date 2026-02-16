import {API_CONFIG} from '../../api/config';

// Smoke-test: ensure we don't accidentally ship broken config values
test('PRODUCTS_URL points to the gist endpoint', () => {
  expect(API_CONFIG.PRODUCTS_URL).toMatch(/^https:\/\/gist\.githubusercontent\.com/);
});

test('timeout is reasonable (5–30 s)', () => {
  expect(API_CONFIG.FETCH_TIMEOUT_MS).toBeGreaterThanOrEqual(5000);
  expect(API_CONFIG.FETCH_TIMEOUT_MS).toBeLessThanOrEqual(30000);
});

test('retries >= 1 so we survive transient failures', () => {
  expect(API_CONFIG.MAX_RETRIES).toBeGreaterThanOrEqual(1);
});

test('cache key is namespaced', () => {
  expect(API_CONFIG.PRODUCTS_CACHE_KEY).toMatch(/^@/);
});

test('CACHE_VERSION is a positive integer', () => {
  expect(Number.isInteger(API_CONFIG.CACHE_VERSION)).toBe(true);
  expect(API_CONFIG.CACHE_VERSION).toBeGreaterThan(0);
});
