import React from 'react';
import {render} from '@testing-library/react-native';
import {ProductListScreen} from '../../screens/ProductListScreen';
import {useProducts} from '../../hooks/useProducts';
import {useNetworkStatus} from '../../hooks/useNetworkStatus';
import {createProductList} from '../helpers/fixtures';

// FlashList doesn't play nice in JSDOM — swap for a plain FlatList
jest.mock('@shopify/flash-list', () => {
  const {FlatList} = require('react-native');
  return {FlashList: FlatList};
});

jest.mock('../../hooks/useProducts');
jest.mock('../../hooks/useNetworkStatus');

const mockUseProducts = useProducts as jest.MockedFunction<typeof useProducts>;
const mockNetStatus = useNetworkStatus as jest.MockedFunction<typeof useNetworkStatus>;

jest.mock('../../utils/image', () => ({
  getSquareImageUrl: (url: string) => url,
}));

const navigation = {navigate: jest.fn()} as any;

function renderScreen() {
  return render(<ProductListScreen navigation={navigation} route={{} as any} />);
}

beforeEach(() => {
  mockNetStatus.mockReturnValue(true);
  jest.clearAllMocks();
});

describe('ProductListScreen', () => {
  it('shows the loading skeleton while fetching', () => {
    mockUseProducts.mockReturnValue({
      products: [],
      displayedProducts: [],
      hasMore: false,
      fetchState: 'loading',
      error: null,
      isHydrated: true,
      isLoadingMore: false,
      isRefreshing: false,
      handleRefresh: jest.fn(),
      handleEndReached: jest.fn(),
    });

    const {getByLabelText} = renderScreen();
    expect(getByLabelText('Loading products')).toBeDefined();
  });

  it('shows an error state on fetch failure', () => {
    mockUseProducts.mockReturnValue({
      products: [],
      displayedProducts: [],
      hasMore: false,
      fetchState: 'error',
      error: 'Unable to connect',
      isHydrated: true,
      isLoadingMore: false,
      isRefreshing: false,
      handleRefresh: jest.fn(),
      handleEndReached: jest.fn(),
    });

    const {getByText} = renderScreen();
    expect(getByText('Unable to connect')).toBeDefined();
    expect(getByText('Try Again')).toBeDefined();
  });

  it('shows empty state when fetch returns no products', () => {
    mockUseProducts.mockReturnValue({
      products: [],
      displayedProducts: [],
      hasMore: false,
      fetchState: 'success',
      error: null,
      isHydrated: true,
      isLoadingMore: false,
      isRefreshing: false,
      handleRefresh: jest.fn(),
      handleEndReached: jest.fn(),
    });

    const {getByText} = renderScreen();
    expect(getByText('No products available')).toBeDefined();
  });

  it('renders the product grid on success', () => {
    const products = createProductList(4);
    mockUseProducts.mockReturnValue({
      products,
      displayedProducts: products,
      hasMore: false,
      fetchState: 'success',
      error: null,
      isHydrated: true,
      isLoadingMore: false,
      isRefreshing: false,
      handleRefresh: jest.fn(),
      handleEndReached: jest.fn(),
    });

    const {getByText} = renderScreen();
    expect(getByText('Product 1')).toBeDefined();
  });

  it('shows the offline banner when disconnected', () => {
    mockNetStatus.mockReturnValue(false);

    const products = createProductList(2);
    mockUseProducts.mockReturnValue({
      products,
      displayedProducts: products,
      hasMore: false,
      fetchState: 'success',
      error: null,
      isHydrated: true,
      isLoadingMore: false,
      isRefreshing: false,
      handleRefresh: jest.fn(),
      handleEndReached: jest.fn(),
    });

    const {getByText} = renderScreen();
    expect(getByText("You're offline")).toBeDefined();
  });
});
