import {renderHook, act, waitFor} from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import {useNetworkStatus} from '../../hooks/useNetworkStatus';

let listenerCallback: ((state: any) => void) | undefined;

beforeEach(() => {
  listenerCallback = undefined;

  (NetInfo.addEventListener as jest.Mock).mockImplementation(cb => {
    listenerCallback = cb;
    return jest.fn(); // unsubscribe
  });

  (NetInfo.fetch as jest.Mock).mockResolvedValue({isConnected: true});
});

afterEach(() => jest.restoreAllMocks());

describe('useNetworkStatus', () => {
  it('defaults to connected', () => {
    const {result} = renderHook(() => useNetworkStatus());
    expect(result.current).toBe(true);
  });

  it('subscribes to NetInfo on mount', () => {
    renderHook(() => useNetworkStatus());
    expect(NetInfo.addEventListener).toHaveBeenCalled();
  });

  it('reflects disconnect events', async () => {
    const {result} = renderHook(() => useNetworkStatus());

    // wait for initial fetch to settle so it doesn't clobber our event
    await act(async () => {
      await Promise.resolve();
    });

    await act(() => {
      listenerCallback?.({isConnected: false});
    });

    expect(result.current).toBe(false);
  });

  it('recovers when connectivity is restored', async () => {
    const {result} = renderHook(() => useNetworkStatus());

    // let initial fetch resolve
    await act(async () => {
      await Promise.resolve();
    });

    await act(() => listenerCallback?.({isConnected: false}));
    expect(result.current).toBe(false);

    await act(() => listenerCallback?.({isConnected: true}));
    expect(result.current).toBe(true);
  });

  it('treats null isConnected as true (initial probe)', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({isConnected: null});
    const {result} = renderHook(() => useNetworkStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toBe(true);
  });

  it('calls unsubscribe on unmount', () => {
    const unsub = jest.fn();
    (NetInfo.addEventListener as jest.Mock).mockReturnValueOnce(unsub);

    const {unmount} = renderHook(() => useNetworkStatus());
    unmount();

    expect(unsub).toHaveBeenCalled();
  });
});
