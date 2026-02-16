import React from 'react';
import {render} from '@testing-library/react-native';
import {PriceDisplay} from '../../components/PriceDisplay';
import type {Money} from '../../types/product';

const cad = (amount: string): Money => ({amount, currencyCode: 'CAD'});

describe('PriceDisplay', () => {
  it('shows the formatted price', () => {
    const {getByText} = render(
      <PriceDisplay price={cad('28.96')} compareAtPrice={null} />,
    );
    expect(getByText(/28\.96/)).toBeDefined();
  });

  it('shows compare-at price when on sale', () => {
    const {getByText} = render(
      <PriceDisplay price={cad('28.96')} compareAtPrice={cad('45.99')} />,
    );
    expect(getByText(/28\.96/)).toBeDefined();
    expect(getByText(/45\.99/)).toBeDefined();
  });

  it('hides compare-at when not on sale (0.00)', () => {
    const {queryByText} = render(
      <PriceDisplay price={cad('28.96')} compareAtPrice={cad('0.00')} />,
    );
    expect(queryByText(/0\.00/)).toBeNull();
  });

  it('builds an a11y label with discount percentage on sale items', () => {
    const {getByLabelText} = render(
      <PriceDisplay price={cad('75.00')} compareAtPrice={cad('100.00')} />,
    );
    // "Save 25%"
    expect(getByLabelText(/Save 25%/)).toBeDefined();
  });

  it('uses the plain price as a11y label when not on sale', () => {
    const {getByLabelText} = render(
      <PriceDisplay price={cad('28.96')} compareAtPrice={null} />,
    );
    expect(getByLabelText(/28.*dollar/i)).toBeDefined();
  });
});
