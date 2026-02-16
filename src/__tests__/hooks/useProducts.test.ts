import {renderHook, act, waitFor} from '@testing-library/react-native';
import {useProducts} from '../../hooks/useProducts';
import {useProductStore} from '../../store/productStore';
import {createProductList} from '../helpers/fixtures';

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
  useProductStore.setState({
    products: [],
    fetchState: 'idle',
    error: null,
    lastFetched: null,
    isHydrated: false,
  });
});

describe('useProducts', () => {
  it('triggers hydration on mount', () => {
    const spy = jest.fn().mockResolvedValue(undefined);
    useProductStore.setState({hydrateFromCache: spy} as any);

    renderHook(() => useProducts());
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('fetches from network after hydration completes', async () => {
    const fetchSpy = jest.fn().mockResolvedValue(undefined);
    useProductStore.setState({
      isHydrated: true,
      fetchProducts: fetchSpy,
    } as any);

    renderHook(() => useProducts());
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
  });

  it('paginates products client-side (page size = 10)', () => {
    useProductStore.setState({
      products: createProductList(25),
      fetchState: 'success',
      isHydrated: true,
    });

    const {result} = renderHook(() => useProducts());

    expect(result.current.displayedProducts).toHaveLength(10);
    expect(result.current.hasMore).toBe(true);
  });

  it('loads the next page on handleEndReached', async () => {
    useProductStore.setState({
      products: createProductList(25),
      fetchState: 'success',
      isHydrated: true,
    });

    const {result} = renderHook(() => useProducts());

    act(() => result.current.handleEndReached());
    act(() => jest.advanceTimersByTime(400));

    expect(result.current.displayedProducts).toHaveLength(20);
    expect(result.current.hasMore).toBe(true);
  });

  it('stops paginating when all products are shown', async () => {
    useProductStore.setState({
      products: createProductList(12),
      fetchState: 'success',
      isHydrated: true,
    });

    const {result} = renderHook(() => useProducts());

    act(() => result.current.handleEndReached());
    act(() => jest.advanceTimersByTime(400));

    expect(result.current.displayedProducts).toHaveLength(12);
    expect(result.current.hasMore).toBe(false);
  });

  it('resets pagination on refresh', async () => {
    const fetchSpy = jest.fn().mockResolvedValue(undefined);
    useProductStore.setState({
      products: createProductList(25),
      fetchState: 'success',
      isHydrated: true,
      fetchProducts: fetchSpy,
    } as any);

    const {result} = renderHook(() => useProducts());

    // paginate forward
    act(() => result.current.handleEndReached());
    act(() => jest.advanceTimersByTime(400));
    expect(result.current.displayedProducts).toHaveLength(20);

    // now refresh — should reset to page 1
    act(() => result.current.handleRefresh());
    expect(result.current.displayedProducts).toHaveLength(10);
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('exposes error and fetchState from the store', () => {
    useProductStore.setState({
      fetchState: 'error',
      error: 'Network timeout',
      isHydrated: true,
    });

    const {result} = renderHook(() => useProducts());

    expect(result.current.fetchState).toBe('error');
    expect(result.current.error).toBe('Network timeout');
  });

  it('derives isRefreshing from fetchState', () => {
    useProductStore.setState({fetchState: 'refreshing', isHydrated: true});
    const {result} = renderHook(() => useProducts());
    expect(result.current.isRefreshing).toBe(true);
  });

  it('ignores handleEndReached when there are no more items', () => {
    useProductStore.setState({
      products: createProductList(8),
      fetchState: 'success',
      isHydrated: true,
    });

    const {result} = renderHook(() => useProducts());

    // only 8 products, page size is 10, so hasMore is false
    expect(result.current.hasMore).toBe(false);

    act(() => result.current.handleEndReached());
    act(() => jest.advanceTimersByTime(400));

    expect(result.current.displayedProducts).toHaveLength(8);
  });
});
