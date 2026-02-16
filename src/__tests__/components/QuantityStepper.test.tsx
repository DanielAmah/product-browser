import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {QuantityStepper} from '../../components/QuantityStepper';

const setup = (qty = 3) => {
  const inc = jest.fn();
  const dec = jest.fn();
  const utils = render(
    <QuantityStepper quantity={qty} onIncrement={inc} onDecrement={dec} />,
  );
  return {...utils, inc, dec};
};

describe('QuantityStepper', () => {
  it('displays the current quantity', () => {
    const {getByText} = setup(5);
    expect(getByText('5')).toBeDefined();
  });

  it('fires onIncrement / onDecrement', () => {
    const {getByLabelText, inc, dec} = setup(3);
    fireEvent.press(getByLabelText('Increase quantity'));
    fireEvent.press(getByLabelText('Decrease quantity'));
    expect(inc).toHaveBeenCalledTimes(1);
    expect(dec).toHaveBeenCalledTimes(1);
  });

  it('switches decrement label to "Remove item" when qty is 1', () => {
    const {getByLabelText} = setup(1);
    expect(getByLabelText(/Remove item/)).toBeDefined();
  });

  it('says "Decrease quantity" when qty > 1', () => {
    const {getByLabelText} = setup(4);
    expect(getByLabelText('Decrease quantity')).toBeDefined();
  });
});
