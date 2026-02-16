import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {ProductInfo} from '../../components/ProductInfo';
import {SAMPLE_PRODUCT, createVariant} from '../helpers/fixtures';

// stub VariantSelector — we test it separately
jest.mock('../../components/VariantSelector', () => ({
  VariantSelector: () => null,
}));

const variant = SAMPLE_PRODUCT.variants[0]; // Black / S
const selectOpt = jest.fn();

const baseProps = {
  product: SAMPLE_PRODUCT,
  selectedVariant: variant,
  selectedOptions: {Color: 'Black', Size: 'S'},
  optionAvailability: {Color: {Black: true, White: true}, Size: {S: true, M: false}},
  onSelectOption: selectOpt,
};

afterEach(() => jest.clearAllMocks());

describe('ProductInfo', () => {
  it('renders title, vendor, and price', () => {
    const {getByText} = render(<ProductInfo {...baseProps} />);

    expect(getByText(SAMPLE_PRODUCT.title)).toBeDefined();
    expect(getByText(SAMPLE_PRODUCT.vendor)).toBeDefined();
    expect(getByText(/28\.96/)).toBeDefined();
  });

  it('shows availability status', () => {
    const {getByText} = render(<ProductInfo {...baseProps} />);
    expect(getByText(/in stock/i)).toBeDefined();
  });

  it('shows "Out of Stock" for unavailable variants', () => {
    const oos = createVariant(
      'v-oos',
      [{name: 'Color', value: 'Red'}],
      false,
    );
    const {getByText} = render(
      <ProductInfo {...baseProps} selectedVariant={oos} />,
    );
    expect(getByText(/out of stock/i)).toBeDefined();
  });

  it('shows a sale badge when compare-at price is set on the variant', () => {
    const saleVariant = createVariant(
      'v-sale',
      [{name: 'Color', value: 'Black'}, {name: 'Size', value: 'S'}],
      true,
      {compareAtPrice: {amount: '45.99', currencyCode: 'CAD'}},
    );
    const {getByText} = render(
      <ProductInfo {...baseProps} selectedVariant={saleVariant} />,
    );
    expect(getByText(/Save \d+%/)).toBeDefined();
  });

  it('toggles the product details section', () => {
    const {getByText, queryByText} = render(<ProductInfo {...baseProps} />);

    // collapsed by default
    expect(queryByText(SAMPLE_PRODUCT.description)).toBeNull();

    fireEvent.press(getByText('Product Details'));
    expect(getByText(SAMPLE_PRODUCT.description)).toBeDefined();
  });
});
