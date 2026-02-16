import {
  fetchProducts,
  readProductsCache,
  writeProductsCache,
  getErrorMessage,
} from '../../api/productApi';
import {NetworkError} from '../../types/api';
import {API_CONFIG} from '../../api/config';

jest.mock('../../utils/retry', () => ({
  fetchWithRetry: jest.fn(),
}));
jest.mock('../../utils/storage', () => ({
  getStorageItem: jest.fn(),
  setStorageItem: jest.fn(),
}));

const {fetchWithRetry} = require('../../utils/retry') as {
  fetchWithRetry: jest.Mock;
};
const {getStorageItem, setStorageItem} = require('../../utils/storage') as {
  getStorageItem: jest.Mock;
  setStorageItem: jest.Mock;
};

beforeEach(() => jest.clearAllMocks());

// ------------------------------------------------------------------
//  fetchProducts
// ------------------------------------------------------------------
describe('fetchProducts', () => {
  it('calls fetchWithRetry with the configured URL, timeout and retries', async () => {
    fetchWithRetry.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await fetchProducts();

    expect(fetchWithRetry).toHaveBeenCalledWith(API_CONFIG.PRODUCTS_URL, {
      timeoutMs: API_CONFIG.FETCH_TIMEOUT_MS,
      maxRetries: API_CONFIG.MAX_RETRIES,
    });
  });

  it('returns the parsed JSON body', async () => {
    const payload = [{id: 'p1', title: 'Widget'}];
    fetchWithRetry.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const products = await fetchProducts();
    expect(products).toEqual(payload);
  });

  it('propagates the error from fetchWithRetry', async () => {
    fetchWithRetry.mockRejectedValueOnce(new NetworkError('502'));
    await expect(fetchProducts()).rejects.toThrow(NetworkError);
  });
});

// ------------------------------------------------------------------
//  readProductsCache / writeProductsCache
// ------------------------------------------------------------------
describe('cache layer', () => {
  it('returns parsed cache when version matches', async () => {
    const entry = {data: [{id: 'p1'}], timestamp: 1, version: API_CONFIG.CACHE_VERSION};
    getStorageItem.mockResolvedValueOnce(entry);

    const result = await readProductsCache();
    expect(result).toEqual(entry);
  });

  it('invalidates cache with a stale version number', async () => {
    getStorageItem.mockResolvedValueOnce({
      data: [],
      timestamp: 1,
      version: API_CONFIG.CACHE_VERSION + 999,
    });
    expect(await readProductsCache()).toBeNull();
  });

  it('returns null when nothing is cached', async () => {
    getStorageItem.mockResolvedValueOnce(null);
    expect(await readProductsCache()).toBeNull();
  });

  it('writeProductsCache stamps the current version and calls setStorageItem', async () => {
    const products = [{id: 'p1'} as any];
    await writeProductsCache(products);

    expect(setStorageItem).toHaveBeenCalledWith(
      API_CONFIG.PRODUCTS_CACHE_KEY,
      expect.objectContaining({
        data: products,
        version: API_CONFIG.CACHE_VERSION,
        timestamp: expect.any(Number),
      }),
    );
  });
});

// ------------------------------------------------------------------
//  getErrorMessage
// ------------------------------------------------------------------
describe('getErrorMessage', () => {
  it('returns timeout copy for timeouts', () => {
    const err = new NetworkError('timeout', true);
    expect(getErrorMessage(err)).toContain('timed out');
  });

  it('returns generic connection copy for other NetworkErrors', () => {
    const err = new NetworkError('500');
    expect(getErrorMessage(err)).toContain('Unable to connect');
  });

  it('falls back to generic copy for non-NetworkError', () => {
    expect(getErrorMessage(new Error('boom'))).toContain('Something went wrong');
    expect(getErrorMessage('random string')).toContain('Something went wrong');
  });
});
