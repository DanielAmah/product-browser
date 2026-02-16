import React from 'react';
import {render} from '@testing-library/react-native';
import {ProductDetailScreen} from '../../screens/ProductDetailScreen';
import {useProductStore} from '../../store/productStore';
import {SAMPLE_PRODUCT} from '../helpers/fixtures';

jest.mock('../../utils/image', () => ({
  getSquareImageUrl: (url: string) => url,
}));

// VariantSelector is tested in isolation
jest.mock('../../components/VariantSelector', () => ({
  VariantSelector: () => null,
}));

beforeEach(() => {
  jest.clearAllMocks();
  useProductStore.setState({products: [SAMPLE_PRODUCT]});
});

function renderScreen(productId = 'p1') {
  return render(
    <ProductDetailScreen route={{params: {productId}} as any} navigation={{} as any} />,
  );
}

describe('ProductDetailScreen', () => {
  it('renders the product title and vendor', () => {
    const {getByText} = renderScreen();

    expect(getByText(SAMPLE_PRODUCT.title)).toBeDefined();
    expect(getByText(SAMPLE_PRODUCT.vendor)).toBeDefined();
  });

  it('shows the price from the default selected variant', () => {
    const {getAllByText} = renderScreen();
    // price may appear in both ProductInfo and AddToCartButton
    expect(getAllByText(/28\.96/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Product not found" for a bogus id', () => {
    const {getByText} = renderScreen('does-not-exist');
    expect(getByText('Product not found')).toBeDefined();
  });

  it('renders the add-to-cart button', () => {
    const {getByLabelText} = renderScreen();
    expect(getByLabelText(/cart/i)).toBeDefined();
  });
});
