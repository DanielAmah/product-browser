export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

/**
 * Discriminated union for fetch lifecycle. Using a string union prevents
 * impossible states (e.g. loading + error simultaneously).
 */
export type FetchState = 'idle' | 'loading' | 'refreshing' | 'error' | 'success';

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly isTimeout: boolean = false,
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}
