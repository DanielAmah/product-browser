import {renderHook, act} from '@testing-library/react-native';
import {AccessibilityInfo} from 'react-native';
import {useAddToCart} from '../../hooks/useAddToCart';
import {useCartStore} from '../../store/cartStore';
import {SAMPLE_PRODUCT, createVariant} from '../helpers/fixtures';
import type {Variant} from '../../types/product';

const variant = SAMPLE_PRODUCT.variants[0]; // Black / S, available

beforeEach(() => {
  jest.clearAllMocks();
  useCartStore.setState({items: []});
});

describe('useAddToCart', () => {
  it('returns the formatted price in the button label', () => {
    const {result} = renderHook(() =>
      useAddToCart({product: SAMPLE_PRODUCT, selectedVariant: variant, isPurchasable: true}),
    );

    expect(result.current.buttonLabel).toContain('28.96');
    expect(result.current.buttonDisabled).toBe(false);
  });

  it('shows "Select options" when no variant is selected', () => {
    const {result} = renderHook(() =>
      useAddToCart({product: SAMPLE_PRODUCT, selectedVariant: undefined, isPurchasable: false}),
    );

    expect(result.current.buttonLabel).toBe('Select options');
    expect(result.current.buttonDisabled).toBe(true);
  });

  it('shows "Currently unavailable" for a non-purchasable variant', () => {
    const oos = createVariant('v-oos', [{name: 'Color', value: 'Red'}], false);

    const {result} = renderHook(() =>
      useAddToCart({product: SAMPLE_PRODUCT, selectedVariant: oos, isPurchasable: false}),
    );

    expect(result.current.buttonLabel).toBe('Currently unavailable');
    expect(result.current.buttonDisabled).toBe(true);
  });

  it('adds item to cart and announces for accessibility', () => {
    const spy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation();

    const {result} = renderHook(() =>
      useAddToCart({product: SAMPLE_PRODUCT, selectedVariant: variant, isPurchasable: true}),
    );

    act(() => result.current.handleAddToCart());

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(spy).toHaveBeenCalledWith('Added to cart');
    spy.mockRestore();
  });

  it('is a no-op when button is disabled', () => {
    const {result} = renderHook(() =>
      useAddToCart({product: SAMPLE_PRODUCT, selectedVariant: undefined, isPurchasable: false}),
    );

    act(() => result.current.handleAddToCart());
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('provides a VoiceOver-friendly accessibility label', () => {
    const {result} = renderHook(() =>
      useAddToCart({product: SAMPLE_PRODUCT, selectedVariant: variant, isPurchasable: true}),
    );

    expect(result.current.buttonAccessibilityLabel).toMatch(/cart/i);
    expect(result.current.buttonAccessibilityLabel).toMatch(/28/);
  });
});
