import type {Product, Variant, ProductOption} from '../../types/product';
import type {CartItem, CartItemInput} from '../../types/cart';

// Reusable variant builder — keeps test files lean
export const createVariant = (
  id: string,
  options: {name: string; value: string}[],
  availableForSale = true,
  overrides: Partial<Variant> = {},
): Variant => ({
  id,
  title: options.map(o => o.value).join(' / '),
  quantityAvailable: availableForSale ? 5 : 0,
  availableForSale,
  currentlyNotInStock: !availableForSale,
  price: {amount: '28.96', currencyCode: 'CAD'},
  compareAtPrice: null,
  sku: `SKU-${id}`,
  selectedOptions: options,
  image: {id: `img-${id}`, url: `https://cdn.example.com/${id}.jpg`},
  ...overrides,
});

// Bare-minimum valid product
export const SAMPLE_PRODUCT: Product = {
  id: 'p1',
  title: 'Dreamfarm Garject',
  description: 'A garlic press that self-cleans.',
  descriptionHtml: '<p>A garlic press that self-cleans.</p>',
  availableForSale: true,
  handle: 'dreamfarm-garject',
  productType: 'Kitchen Tools',
  tags: ['sale', 'kitchen'],
  vendor: 'Dreamfarm',
  priceRange: {
    minVariantPrice: {amount: '28.96', currencyCode: 'CAD'},
    maxVariantPrice: {amount: '45.00', currencyCode: 'CAD'},
  },
  compareAtPriceRange: {
    minVariantPrice: {amount: '45.99', currencyCode: 'CAD'},
    maxVariantPrice: {amount: '45.99', currencyCode: 'CAD'},
  },
  images: [
    {id: 'img1', url: 'https://cdn.example.com/garject_600x600.jpg'},
    {id: 'img2', url: 'https://cdn.example.com/garject-side_600x600.jpg'},
  ],
  media: [],
  options: [
    {id: 'opt-color', name: 'Color', values: ['Black', 'White']},
    {id: 'opt-size', name: 'Size', values: ['S', 'M']},
  ],
  variants: [
    createVariant('var-bs', [{name: 'Color', value: 'Black'}, {name: 'Size', value: 'S'}]),
    createVariant('var-ws', [{name: 'Color', value: 'White'}, {name: 'Size', value: 'S'}]),
    createVariant('var-bm', [{name: 'Color', value: 'Black'}, {name: 'Size', value: 'M'}], false),
    createVariant('var-wm', [{name: 'Color', value: 'White'}, {name: 'Size', value: 'M'}]),
  ],
  collections: ['kitchen', 'bestsellers'],
  onlineStoreUrl: 'https://example.com/products/dreamfarm-garject',
};

// Cheap way to get a product that isn't on sale
export const PRODUCT_NO_SALE: Product = {
  ...SAMPLE_PRODUCT,
  id: 'p2',
  title: 'Plain Spoon',
  compareAtPriceRange: {
    minVariantPrice: {amount: '0.00', currencyCode: 'CAD'},
    maxVariantPrice: {amount: '0.00', currencyCode: 'CAD'},
  },
};

export const CART_ITEM: CartItem = {
  variantId: 'var-bs',
  productId: 'p1',
  productTitle: 'Dreamfarm Garject',
  variantTitle: 'Black / S',
  price: {amount: '28.96', currencyCode: 'CAD'},
  quantity: 2,
  image: {id: 'img1', url: 'https://cdn.example.com/garject.jpg'},
  selectedOptions: [{name: 'Color', value: 'Black'}, {name: 'Size', value: 'S'}],
};

export const CART_ITEM_INPUT: CartItemInput = {
  variantId: 'var-bs',
  productId: 'p1',
  productTitle: 'Dreamfarm Garject',
  variantTitle: 'Black / S',
  price: {amount: '28.96', currencyCode: 'CAD'},
  image: {id: 'img1', url: 'https://cdn.example.com/garject.jpg'},
  selectedOptions: [{name: 'Color', value: 'Black'}, {name: 'Size', value: 'S'}],
};

// Produce N dummy products for list/pagination tests
export function createProductList(count: number): Product[] {
  return Array.from({length: count}, (_, i) => ({
    ...SAMPLE_PRODUCT,
    id: `p${i + 1}`,
    title: `Product ${i + 1}`,
    handle: `product-${i + 1}`,
  }));
}
