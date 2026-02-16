import {renderHook, act} from '@testing-library/react-native';
import {useVariantSelection} from '../../hooks/useVariantSelection';
import {SAMPLE_PRODUCT, createVariant} from '../helpers/fixtures';
import type {Product} from '../../types/product';

describe('useVariantSelection', () => {
  it('picks the first purchasable variant by default', () => {
    const {result} = renderHook(() => useVariantSelection(SAMPLE_PRODUCT));

    // first available is Black / S
    expect(result.current.selectedOptions).toEqual({Color: 'Black', Size: 'S'});
    expect(result.current.selectedVariant?.id).toBe('var-bs');
    expect(result.current.isPurchasable).toBe(true);
  });

  it('updates selection via selectOption', () => {
    const {result} = renderHook(() => useVariantSelection(SAMPLE_PRODUCT));

    act(() => result.current.selectOption('Color', 'White'));

    expect(result.current.selectedOptions.Color).toBe('White');
  });

  it('reports purchasability as false for an out-of-stock combo', () => {
    const {result} = renderHook(() => useVariantSelection(SAMPLE_PRODUCT));

    // Black / M is marked unavailable in fixtures
    act(() => result.current.selectOption('Size', 'M'));
    act(() => result.current.selectOption('Color', 'Black'));

    expect(result.current.isPurchasable).toBe(false);
  });

  it('computes option availability relative to the current selection', () => {
    const {result} = renderHook(() => useVariantSelection(SAMPLE_PRODUCT));

    // with Color=Black selected, Size M should be unavailable (var-bm is OOS)
    expect(result.current.optionAvailability.Size?.M).toBe(false);
    expect(result.current.optionAvailability.Size?.S).toBe(true);
  });

  it('resolves displayImage from the selected variant', () => {
    const {result} = renderHook(() => useVariantSelection(SAMPLE_PRODUCT));
    expect(result.current.displayImage?.url).toContain('var-bs');
  });

  it('falls back to the first product image when variant has no image', () => {
    const noImgVariant = createVariant(
      'v-nope',
      [{name: 'Color', value: 'Black'}, {name: 'Size', value: 'S'}],
      true,
      {image: undefined as any},
    );
    const product: Product = {
      ...SAMPLE_PRODUCT,
      variants: [noImgVariant],
    };

    const {result} = renderHook(() => useVariantSelection(product));
    expect(result.current.displayImage?.id).toBe('img1');
  });

  it('returns safe defaults for undefined product', () => {
    const {result} = renderHook(() => useVariantSelection(undefined));

    expect(result.current.selectedOptions).toEqual({});
    expect(result.current.selectedVariant).toBeUndefined();
    expect(result.current.isPurchasable).toBe(false);
  });

  it('resets selections when the product id changes', () => {
    let product = SAMPLE_PRODUCT;
    const {result, rerender} = renderHook(() => useVariantSelection(product));

    act(() => result.current.selectOption('Color', 'White'));
    expect(result.current.selectedOptions.Color).toBe('White');

    // swap to a different product
    product = {...SAMPLE_PRODUCT, id: 'p2'};
    rerender({});

    // should have reset to defaults
    expect(result.current.selectedOptions.Color).toBe('Black');
  });
});
