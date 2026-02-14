/**
 * Fetch with Retry Utility
 *
 * Implements fetch with timeout, retry, and exponential backoff.
 */

import {NetworkError} from '@apptypes/api';

interface FetchWithRetryOptions {
  timeoutMs: number;
  maxRetries: number;
  signal?: AbortSignal;
}

/**
 * Delay helper for exponential backoff
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with automatic retry and timeout handling.
 *
 * @param url - The URL to fetch
 * @param options - Configuration options
 * @returns The fetch Response
 * @throws NetworkError on failure
 */
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

      // Handle AbortError (timeout)
      if (err instanceof Error && err.name === 'AbortError') {
        lastError = new NetworkError('Request timed out', true);
      } else if (err instanceof NetworkError) {
        lastError = err;
      } else if (err instanceof Error) {
        lastError = new NetworkError(err.message, false);
      } else {
        lastError = new NetworkError(String(err), false);
      }

      // Don't retry on last attempt
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        await delay(Math.pow(2, attempt) * 1000);
      }
    }
  }

  throw lastError || new NetworkError('Unknown error', false);
}
