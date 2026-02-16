import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {AddToCartButton} from '../../components/AddToCartButton';

const defaults = {
  label: 'Add to Cart — CA$28.96',
  accessibilityLabel: 'Add to cart for 28 dollars and 96 cents',
  disabled: false,
  bottomInset: 0,
  onPress: jest.fn(),
};

afterEach(() => jest.clearAllMocks());

describe('AddToCartButton', () => {
  test('fires onPress and shows the label', () => {
    const {getByText} = render(<AddToCartButton {...defaults} />);

    fireEvent.press(getByText(/Add to Cart/));
    expect(defaults.onPress).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled=true', () => {
    const onPress = jest.fn();
    const {getByLabelText} = render(
      <AddToCartButton {...defaults} disabled onPress={onPress} />,
    );

    const btn = getByLabelText(defaults.accessibilityLabel);
    expect(btn.props.accessibilityState).toEqual(
      expect.objectContaining({disabled: true}),
    );
  });

  test('uses the a11y label provided via props', () => {
    const {getByLabelText} = render(<AddToCartButton {...defaults} />);
    expect(getByLabelText(defaults.accessibilityLabel)).toBeDefined();
  });
});
