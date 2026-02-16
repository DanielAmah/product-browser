import {renderHook, act} from '@testing-library/react-native';
import {useCart} from '../../hooks/useCart';
import {useCartStore} from '../../store/cartStore';
import {CART_ITEM} from '../helpers/fixtures';

// stub navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: mockNavigate}),
}));

beforeEach(() => {
  jest.clearAllMocks();
  useCartStore.setState({items: []});
});

describe('useCart', () => {
  it('isEmpty is true for an empty cart', () => {
    const {result} = renderHook(() => useCart());
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.totalItems).toBe(0);
  });

  it('exposes items from the store', () => {
    useCartStore.setState({items: [CART_ITEM]});
    const {result} = renderHook(() => useCart());

    expect(result.current.items).toHaveLength(1);
    expect(result.current.isEmpty).toBe(false);
  });

  it('calculates subtotal correctly', () => {
    // 28.96 * 2 = 57.92
    useCartStore.setState({items: [CART_ITEM]});
    const {result} = renderHook(() => useCart());

    expect(result.current.subtotal).toBeCloseTo(57.92);
    expect(result.current.subtotalFormatted).toContain('57.92');
  });

  it('handleUpdateQuantity adjusts the item qty', () => {
    useCartStore.setState({items: [{...CART_ITEM, quantity: 1}]});
    const {result} = renderHook(() => useCart());

    act(() => result.current.handleUpdateQuantity(CART_ITEM.variantId, 1));
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('handleRemove pulls the item from the store', () => {
    useCartStore.setState({items: [CART_ITEM]});
    const {result} = renderHook(() => useCart());

    act(() => result.current.handleRemove(CART_ITEM.variantId));
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('handleContinueShopping navigates to the product list', () => {
    const {result} = renderHook(() => useCart());
    act(() => result.current.handleContinueShopping());

    expect(mockNavigate).toHaveBeenCalledWith('ProductsTab', {screen: 'ProductList'});
  });

  it('subtotalAccessibilityLabel includes a dollar amount', () => {
    useCartStore.setState({items: [CART_ITEM]});
    const {result} = renderHook(() => useCart());

    expect(result.current.subtotalAccessibilityLabel).toMatch(/57.*dollar/i);
  });

  it('totalItems sums quantities across items', () => {
    useCartStore.setState({
      items: [
        {...CART_ITEM, variantId: 'a', quantity: 3},
        {...CART_ITEM, variantId: 'b', quantity: 2},
      ],
    });
    const {result} = renderHook(() => useCart());
    expect(result.current.totalItems).toBe(5);
  });
});
