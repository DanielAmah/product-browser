import React from 'react';
import {render} from '@testing-library/react-native';
import {CartSummary} from '../../components/CartSummary';

const defaults = {
  totalItems: 3,
  subtotalFormatted: 'CA$86.88',
  subtotalAccessibilityLabel: 'Total: 86 dollars and 88 cents Canadian',
  bottomInset: 0,
};

describe('CartSummary', () => {
  test('renders subtotal and item count', () => {
    const {getAllByText, getByText} = render(<CartSummary {...defaults} />);

    // subtotal appears in both the line and the total row
    expect(getAllByText('CA$86.88').length).toBeGreaterThanOrEqual(1);
    expect(getByText(/3 items/)).toBeDefined();
  });

  test('uses singular "item" for a single item', () => {
    const {getByText} = render(
      <CartSummary {...defaults} totalItems={1} />,
    );
    expect(getByText(/1 item\b/)).toBeDefined();
  });

  test('shows the checkout button', () => {
    const {getByLabelText} = render(<CartSummary {...defaults} />);
    expect(getByLabelText('Proceed to checkout')).toBeDefined();
  });
});
