import React from 'react';
import {render} from '@testing-library/react-native';
import {CartScreen} from '../../screens/CartScreen';
import {useCartStore} from '../../store/cartStore';
import {CART_ITEM} from '../helpers/fixtures';

jest.mock('@shopify/flash-list', () => {
  const {FlatList} = require('react-native');
  return {FlashList: FlatList};
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn()}),
}));

beforeEach(() => {
  jest.clearAllMocks();
  useCartStore.setState({items: []});
});

describe('CartScreen', () => {
  it('shows empty state when cart is empty', () => {
    const {getByText} = render(<CartScreen />);

    expect(getByText('Your cart is empty')).toBeDefined();
    expect(getByText('Continue Shopping')).toBeDefined();
  });

  it('renders line items when the cart has products', () => {
    useCartStore.setState({items: [CART_ITEM]});
    const {getByText} = render(<CartScreen />);

    expect(getByText(CART_ITEM.productTitle)).toBeDefined();
    expect(getByText(CART_ITEM.variantTitle)).toBeDefined();
  });

  it('renders the cart summary with the subtotal', () => {
    useCartStore.setState({items: [CART_ITEM]});
    const {getAllByText} = render(<CartScreen />);

    // 28.96 * 2 = 57.92 — may appear more than once (subtotal + total)
    expect(getAllByText(/57\.92/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Checkout" button when items exist', () => {
    useCartStore.setState({items: [CART_ITEM]});
    const {getByLabelText} = render(<CartScreen />);

    expect(getByLabelText('Proceed to checkout')).toBeDefined();
  });
});
