/**
 * Availability Utilities
 *
 * Functions for variant selection and availability checking.
 */

import type {Variant, ProductOption} from '@apptypes/product';

/**
 * Find a variant that matches the given option selections.
 *
 * @param variants - All variants for a product
 * @param selections - Current option selections { "Color": "Black", "Size": "S" }
 * @returns The matching variant, or undefined if no match
 */
export function findVariantByOptions(
  variants: Variant[],
  selections: Record<string, string>,
): Variant | undefined {
  return variants.find(variant =>
    variant.selectedOptions.every(opt => selections[opt.name] === opt.value),
  );
}

/**
 * Check if a variant is purchasable.
 * The single source of truth is availableForSale.
 */
export function isVariantPurchasable(variant: Variant | undefined): boolean {
  return variant?.availableForSale ?? false;
}

/**
 * Calculate which option values are available given current selections.
 *
 * For each option axis, check which values would lead to an available variant
 * when combined with the other current selections.
 *
 * @param variants - All variants for a product
 * @param options - Product options (axes like Color, Size)
 * @param currentSelections - Current option selections
 * @returns Availability map: { "Size": { "S": true, "M": true, "L": false } }
 */
export function getOptionAvailability(
  variants: Variant[],
  options: ProductOption[],
  currentSelections: Record<string, string>,
): Record<string, Record<string, boolean>> {
  const result: Record<string, Record<string, boolean>> = {};

  for (const option of options) {
    result[option.name] = {};

    for (const value of option.values) {
      // Create hypothetical selection with this value
      const hypothetical = {...currentSelections, [option.name]: value};

      // Check if any variant matches this hypothetical and is available
      const matchingVariant = findVariantByOptions(variants, hypothetical);
      result[option.name][value] = matchingVariant?.availableForSale ?? false;
    }
  }

  return result;
}

/**
 * Get the default option selections for a product.
 * Selects the first available variant's options, or falls back to first variant.
 */
export function getDefaultSelections(
  variants: Variant[],
  options: ProductOption[],
): Record<string, string> {
  // Try to find first available variant
  const firstAvailable = variants.find(v => v.availableForSale);
  const defaultVariant = firstAvailable || variants[0];

  if (!defaultVariant) {
    // No variants at all, return empty selections
    return {};
  }

  // Convert variant's selectedOptions to a Record
  const selections: Record<string, string> = {};
  for (const opt of defaultVariant.selectedOptions) {
    selections[opt.name] = opt.value;
  }

  return selections;
}
