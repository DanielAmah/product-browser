import type {Variant, ProductOption} from '@apptypes/product';

/** Find the variant matching a full set of option selections. */
export function findVariantByOptions(
  variants: Variant[],
  selections: Record<string, string>,
): Variant | undefined {
  return variants.find(variant =>
    variant.selectedOptions.every(opt => selections[opt.name] === opt.value),
  );
}

/** Single source of truth: `availableForSale` from the Shopify API. */
export function isVariantPurchasable(variant: Variant | undefined): boolean {
  return variant?.availableForSale ?? false;
}

/**
 * For each option axis, determine which values lead to a purchasable variant
 * when combined with the current selections on all other axes.
 *
 * Returns e.g. `{ Size: { S: true, M: true, L: false } }`
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
      const hypothetical = {...currentSelections, [option.name]: value};
      const matchingVariant = findVariantByOptions(variants, hypothetical);
      result[option.name][value] = matchingVariant?.availableForSale ?? false;
    }
  }

  return result;
}

/** Pick the first available variant's options, or fall back to the first variant. */
export function getDefaultSelections(
  variants: Variant[],
  options: ProductOption[],
): Record<string, string> {
  const firstAvailable = variants.find(v => v.availableForSale);
  const defaultVariant = firstAvailable || variants[0];

  if (!defaultVariant) {
    return {};
  }

  const selections: Record<string, string> = {};
  for (const opt of defaultVariant.selectedOptions) {
    selections[opt.name] = opt.value;
  }
  return selections;
}
