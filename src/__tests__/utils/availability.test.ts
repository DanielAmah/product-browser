/**
 * Availability Utilities Tests
 */

import {
  findVariantByOptions,
  isVariantPurchasable,
  getOptionAvailability,
  getDefaultSelections,
} from '../../utils/availability';
import type {Variant, ProductOption} from '../../types/product';

// Mock variant factory
const createVariant = (
  id: string,
  options: {name: string; value: string}[],
  availableForSale: boolean,
  quantityAvailable: number = 10,
): Variant => ({
  id,
  title: options.map(o => o.value).join(' / '),
  quantityAvailable,
  availableForSale,
  currentlyNotInStock: !availableForSale,
  price: {amount: '28.96', currencyCode: 'CAD'},
  compareAtPrice: null,
  sku: `SKU-${id}`,
  selectedOptions: options,
  image: {id: 'img-1', url: 'https://example.com/image.jpg'},
});

describe('availability utilities', () => {
  describe('findVariantByOptions', () => {
    const variants: Variant[] = [
      createVariant('v1', [{name: 'Color', value: 'Black'}, {name: 'Size', value: 'S'}], true),
      createVariant('v2', [{name: 'Color', value: 'Black'}, {name: 'Size', value: 'M'}], true),
      createVariant('v3', [{name: 'Color', value: 'White'}, {name: 'Size', value: 'S'}], false),
    ];

    it('finds variant matching all options', () => {
      const result = findVariantByOptions(variants, {Color: 'Black', Size: 'S'});
      expect(result?.id).toBe('v1');
    });

    it('returns undefined when no match', () => {
      const result = findVariantByOptions(variants, {Color: 'Red', Size: 'S'});
      expect(result).toBeUndefined();
    });

    it('returns undefined for partial match', () => {
      const result = findVariantByOptions(variants, {Color: 'Black'});
      expect(result).toBeUndefined();
    });
  });

  describe('isVariantPurchasable', () => {
    it('returns true for available variant', () => {
      const variant = createVariant('v1', [{name: 'Size', value: 'S'}], true);
      expect(isVariantPurchasable(variant)).toBe(true);
    });

    it('returns false for unavailable variant', () => {
      const variant = createVariant('v1', [{name: 'Size', value: 'S'}], false);
      expect(isVariantPurchasable(variant)).toBe(false);
    });

    it('returns false for undefined variant', () => {
      expect(isVariantPurchasable(undefined)).toBe(false);
    });

    it('ignores quantityAvailable - uses availableForSale only', () => {
      // This tests the edge case from the data: qty=8 but available=false
      const variant = createVariant('v1', [{name: 'Size', value: 'S'}], false, 8);
      expect(isVariantPurchasable(variant)).toBe(false);
    });

    it('handles negative quantity with availableForSale=true', () => {
      const variant = createVariant('v1', [{name: 'Size', value: 'S'}], true, -5);
      expect(isVariantPurchasable(variant)).toBe(true);
    });
  });

  describe('getOptionAvailability', () => {
    const variants: Variant[] = [
      createVariant('v1', [{name: 'Color', value: 'Black'}, {name: 'Size', value: 'S'}], true),
      createVariant('v2', [{name: 'Color', value: 'Black'}, {name: 'Size', value: 'M'}], true),
      createVariant('v3', [{name: 'Color', value: 'Black'}, {name: 'Size', value: 'L'}], false),
      createVariant('v4', [{name: 'Color', value: 'White'}, {name: 'Size', value: 'S'}], true),
      createVariant('v5', [{name: 'Color', value: 'White'}, {name: 'Size', value: 'M'}], false),
    ];

    const options: ProductOption[] = [
      {id: 'opt1', name: 'Color', values: ['Black', 'White']},
      {id: 'opt2', name: 'Size', values: ['S', 'M', 'L']},
    ];

    it('returns availability for all option values', () => {
      const result = getOptionAvailability(variants, options, {Color: 'Black', Size: 'S'});

      // When Color=Black is selected, check Size availability
      expect(result.Size.S).toBe(true);
      expect(result.Size.M).toBe(true);
      expect(result.Size.L).toBe(false);

      // When Size=S is selected, check Color availability
      expect(result.Color.Black).toBe(true);
      expect(result.Color.White).toBe(true);
    });

    it('updates availability when selection changes', () => {
      const result = getOptionAvailability(variants, options, {Color: 'White', Size: 'S'});

      // When Color=White is selected, M is unavailable
      expect(result.Size.S).toBe(true);
      expect(result.Size.M).toBe(false);
    });
  });

  describe('getDefaultSelections', () => {
    it('selects first available variant options', () => {
      const variants: Variant[] = [
        createVariant('v1', [{name: 'Size', value: 'S'}], false),
        createVariant('v2', [{name: 'Size', value: 'M'}], true),
        createVariant('v3', [{name: 'Size', value: 'L'}], true),
      ];
      const options: ProductOption[] = [{id: 'opt1', name: 'Size', values: ['S', 'M', 'L']}];

      const result = getDefaultSelections(variants, options);
      expect(result.Size).toBe('M'); // First available
    });

    it('falls back to first variant when none available', () => {
      const variants: Variant[] = [
        createVariant('v1', [{name: 'Size', value: 'S'}], false),
        createVariant('v2', [{name: 'Size', value: 'M'}], false),
      ];
      const options: ProductOption[] = [{id: 'opt1', name: 'Size', values: ['S', 'M']}];

      const result = getDefaultSelections(variants, options);
      expect(result.Size).toBe('S'); // First variant
    });

    it('returns empty object when no variants', () => {
      const result = getDefaultSelections([], []);
      expect(result).toEqual({});
    });
  });
});
