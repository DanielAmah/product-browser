export interface Money {
  amount: string; // string from API, parsed at usage site
  currencyCode: string;
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface MediaImage {
  mediaContentType: 'IMAGE';
  image: {
    url: string;
    id: string;
    altText: string | null;
    width: number;
    height: number;
  };
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface Variant {
  id: string;
  title: string;
  quantityAvailable: number;
  availableForSale: boolean;
  currentlyNotInStock: boolean;
  price: Money;
  compareAtPrice: Money | null;
  sku: string;
  selectedOptions: SelectedOption[];
  image: ProductImage;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  handle: string;
  productType: string;
  tags: string[];
  vendor: string;
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  compareAtPriceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  images: ProductImage[];
  media: MediaImage[];
  options: ProductOption[];
  variants: Variant[];
  collections: string[];
  onlineStoreUrl: string;
}
