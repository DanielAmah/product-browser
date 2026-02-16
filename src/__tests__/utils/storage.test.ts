import AsyncStorage from '@react-native-async-storage/async-storage';
import {getStorageItem, setStorageItem, removeStorageItem} from '../../utils/storage';

beforeEach(() => jest.clearAllMocks());

describe('getStorageItem', () => {
  it('parses JSON from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({name: 'products', count: 42}),
    );
    const result = await getStorageItem<{name: string; count: number}>('key');
    expect(result).toEqual({name: 'products', count: 42});
  });

  it('returns null for missing keys', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    expect(await getStorageItem('nope')).toBeNull();
  });

  it('swallows errors and returns null', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
    expect(await getStorageItem('key')).toBeNull();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('key'), expect.any(Error));
    spy.mockRestore();
  });
});

describe('setStorageItem', () => {
  it('serialises to JSON and writes', async () => {
    await setStorageItem('cache', {data: [1, 2]});
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('cache', '{"data":[1,2]}');
  });

  it('does not throw on write failure', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(setStorageItem('k', 'v')).resolves.toBeUndefined();
    spy.mockRestore();
  });
});

describe('removeStorageItem', () => {
  it('delegates to AsyncStorage.removeItem', async () => {
    await removeStorageItem('cache');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('cache');
  });

  it('does not throw on removal failure', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(removeStorageItem('key')).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
