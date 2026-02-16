import {fetchWithRetry} from '../../utils/retry';
import {NetworkError} from '../../types/api';

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.useFakeTimers();

beforeEach(() => mockFetch.mockReset());

describe('fetchWithRetry', () => {
  it('returns the response on a clean 200', async () => {
    const res = {ok: true, json: () => Promise.resolve([])};
    mockFetch.mockResolvedValueOnce(res);

    const result = await fetchWithRetry('https://api.example.com', {
      timeoutMs: 5000,
      maxRetries: 2,
    });

    expect(result).toBe(res);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('throws NetworkError on non-2xx', async () => {
    mockFetch.mockResolvedValue({ok: false, status: 500});

    await expect(
      fetchWithRetry('https://api.example.com', {timeoutMs: 5000, maxRetries: 0}),
    ).rejects.toThrow(NetworkError);
  });

  it('retries then succeeds on the third attempt', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce({ok: true});

    const promise = fetchWithRetry('https://api.example.com', {
      timeoutMs: 5000,
      maxRetries: 2,
    });

    // backoff: 1s after attempt 0, 2s after attempt 1
    await jest.advanceTimersByTimeAsync(1000);
    await jest.advanceTimersByTimeAsync(2000);

    const result = await promise;
    expect(result).toEqual({ok: true});
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('gives up after maxRetries and throws the last error', async () => {
    mockFetch.mockRejectedValue(new Error('always fails'));

    let caught: unknown;
    try {
      await fetchWithRetry('https://api.example.com', {
        timeoutMs: 5000,
        maxRetries: 0,
      });
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(NetworkError);
    expect((caught as NetworkError).message).toBe('always fails');
  });

  it('marks AbortError as a timeout', async () => {
    const abortErr = new Error('Aborted');
    abortErr.name = 'AbortError';
    mockFetch.mockRejectedValue(abortErr);

    let caught: unknown;
    try {
      await fetchWithRetry('https://api.example.com', {timeoutMs: 100, maxRetries: 0});
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(NetworkError);
    expect((caught as NetworkError).isTimeout).toBe(true);
  });

  it('wraps non-Error rejects (e.g. string) in NetworkError', async () => {
    mockFetch.mockRejectedValue('connection refused');

    await expect(
      fetchWithRetry('https://api.example.com', {timeoutMs: 5000, maxRetries: 0}),
    ).rejects.toThrow(NetworkError);
  });

  it('includes the HTTP status in the error message', async () => {
    mockFetch.mockResolvedValue({ok: false, status: 404});

    let caught: unknown;
    try {
      await fetchWithRetry('https://api.example.com', {timeoutMs: 5000, maxRetries: 0});
    } catch (err) {
      caught = err;
    }

    expect((caught as NetworkError).message).toContain('404');
    expect((caught as NetworkError).isTimeout).toBe(false);
  });
});
