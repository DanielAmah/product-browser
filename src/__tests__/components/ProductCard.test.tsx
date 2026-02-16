import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {ProductCard} from '../../components/ProductCard';
import {SAMPLE_PRODUCT, PRODUCT_NO_SALE} from '../helpers/fixtures';

jest.mock('../../utils/image', () => ({
  getSquareImageUrl: (url: string) => url, // pass through
}));

const onPress = jest.fn();

afterEach(() => jest.clearAllMocks());

describe('ProductCard', () => {
  it('shows title, uppercased vendor, and price', () => {
    const {getByText} = render(
      <ProductCard product={SAMPLE_PRODUCT} onPress={onPress} />,
    );

    expect(getByText(SAMPLE_PRODUCT.title)).toBeDefined();
    expect(getByText('DREAMFARM')).toBeDefined();
    expect(getByText(/28\.96/)).toBeDefined();
  });

  it('shows a sale badge for items with a compare-at price', () => {
    const {getByText} = render(
      <ProductCard product={SAMPLE_PRODUCT} onPress={onPress} />,
    );
    expect(getByText(/Save \d+%/)).toBeDefined();
  });

  it('hides the sale badge when not on sale', () => {
    const {queryByText} = render(
      <ProductCard product={PRODUCT_NO_SALE} onPress={onPress} />,
    );
    expect(queryByText(/Save \d+%/)).toBeNull();
  });

  it('fires onPress on tap', () => {
    const {getAllByLabelText} = render(
      <ProductCard product={SAMPLE_PRODUCT} onPress={onPress} />,
    );

    // card has the title in its a11y label; image also does — grab the first (the Pressable)
    fireEvent.press(getAllByLabelText(new RegExp(SAMPLE_PRODUCT.title))[0]);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders a placeholder when the product has no images', () => {
    const noImg = {...SAMPLE_PRODUCT, images: []};
    const {toJSON} = render(<ProductCard product={noImg} onPress={onPress} />);
    expect(toJSON()).not.toBeNull(); // doesn't crash
  });
});
