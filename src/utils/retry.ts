import {NetworkError} from '@apptypes/api';

interface FetchWithRetryOptions {
  timeoutMs: number;
  maxRetries: number;
  signal?: AbortSignal;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Fetch with automatic retry, timeout, and exponential backoff. */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions,
): Promise<Response> {
  const {timeoutMs, maxRetries} = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {signal: controller.signal});
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new NetworkError(`HTTP ${response.status}`, false);
      }

      return response;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof Error && err.name === 'AbortError') {
        lastError = new NetworkError('Request timed out', true);
      } else if (err instanceof NetworkError) {
        lastError = err;
      } else if (err instanceof Error) {
        lastError = new NetworkError(err.message, false);
      } else {
        lastError = new NetworkError(String(err), false);
      }

      if (attempt < maxRetries) {
        await delay(Math.pow(2, attempt) * 1000); // exponential backoff
      }
    }
  }

  throw lastError || new NetworkError('Unknown error', false);
}
