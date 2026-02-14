/**
 * useNetworkStatus Hook
 *
 * Subscribes to network state changes via NetInfo.
 */

import {useState, useEffect} from 'react';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';

/**
 * Hook that returns the current network connectivity status.
 *
 * @returns true if connected to the internet, false otherwise
 */
export function useNetworkStatus(): boolean {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      // isConnected can be null during initial check
      setIsConnected(state.isConnected ?? true);
    });

    // Check initial state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isConnected;
}
