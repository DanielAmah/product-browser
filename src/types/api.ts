/**
 * API Types
 *
 * Types for cache entries, fetch states, and network errors.
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number; // Date.now() at write time
  version: number; // schema version for migration
}

/**
 * Discriminated union for fetch states.
 * Using a string union prevents impossible states (loading + error simultaneously).
 *
 * - 'idle': Initial state, no fetch attempted
 * - 'loading': First fetch in progress, no cached data
 * - 'refreshing': Fetch in progress, cached data is being shown
 * - 'error': Fetch failed, no cached data to show
 * - 'success': Fetch completed successfully
 */
export type FetchState = 'idle' | 'loading' | 'refreshing' | 'error' | 'success';

/**
 * Custom error class for network-related errors.
 * Allows distinguishing between timeouts and other network failures.
 */
export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly isTimeout: boolean = false,
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}
