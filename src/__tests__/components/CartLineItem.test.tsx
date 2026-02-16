import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {CartLineItem} from '../../components/CartLineItem';
import {CART_ITEM} from '../helpers/fixtures';

const onUpdate = jest.fn();
const onRemove = jest.fn();

afterEach(() => jest.clearAllMocks());

describe('CartLineItem', () => {
  it('shows product title and variant', () => {
    const {getByText} = render(
      <CartLineItem item={CART_ITEM} onUpdateQuantity={onUpdate} onRemove={onRemove} />,
    );
    expect(getByText(CART_ITEM.productTitle)).toBeDefined();
    expect(getByText(CART_ITEM.variantTitle)).toBeDefined();
  });

  it('calculates and displays the line total (price * qty)', () => {
    // 28.96 * 2 = 57.92
    const {getByText} = render(
      <CartLineItem item={CART_ITEM} onUpdateQuantity={onUpdate} onRemove={onRemove} />,
    );
    expect(getByText(/57\.92/)).toBeDefined();
  });

  it('increment calls onUpdateQuantity with +1', () => {
    const {getByLabelText} = render(
      <CartLineItem item={CART_ITEM} onUpdateQuantity={onUpdate} onRemove={onRemove} />,
    );
    fireEvent.press(getByLabelText('Increase quantity'));
    expect(onUpdate).toHaveBeenCalledWith(CART_ITEM.variantId, 1);
  });

  it('decrement with qty=1 removes the item', () => {
    const single = {...CART_ITEM, quantity: 1};
    const {getByLabelText} = render(
      <CartLineItem item={single} onUpdateQuantity={onUpdate} onRemove={onRemove} />,
    );

    fireEvent.press(getByLabelText(/Remove item/));
    expect(onRemove).toHaveBeenCalledWith(CART_ITEM.variantId);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('decrement with qty>1 calls onUpdateQuantity with -1', () => {
    const {getByLabelText} = render(
      <CartLineItem item={CART_ITEM} onUpdateQuantity={onUpdate} onRemove={onRemove} />,
    );
    fireEvent.press(getByLabelText('Decrease quantity'));
    expect(onUpdate).toHaveBeenCalledWith(CART_ITEM.variantId, -1);
  });
});
