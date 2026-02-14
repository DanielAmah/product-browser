/**
 * Jest Setup File
 */

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = {top: 0, right: 0, bottom: 0, left: 0};
  return {
    SafeAreaProvider: ({children}) => children,
    SafeAreaView: ({children}) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({x: 0, y: 0, width: 390, height: 844}),
  };
});

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
    }),
  ),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  Screen: ({children}) => children,
  ScreenContainer: ({children}) => children,
  NativeScreen: ({children}) => children,
  NativeScreenContainer: ({children}) => children,
  ScreenStack: ({children}) => children,
  ScreenStackHeaderConfig: () => null,
  ScreenStackHeaderSubview: () => null,
  ScreenStackHeaderBackButtonImage: () => null,
  ScreenStackHeaderCenterView: () => null,
  ScreenStackHeaderLeftView: () => null,
  ScreenStackHeaderRightView: () => null,
  SearchBar: () => null,
  FullWindowOverlay: ({children}) => children,
  useHeaderHeight: () => 44,
  useAnimatedHeaderHeight: () => ({value: 44}),
  screensEnabled: jest.fn(() => true),
}));
