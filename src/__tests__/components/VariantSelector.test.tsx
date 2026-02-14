/**
 * VariantSelector Component Tests
 */

import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {VariantSelector} from '../../components/VariantSelector';
import type {ProductOption} from '../../types/product';

describe('VariantSelector', () => {
  const mockOptions: ProductOption[] = [
    {id: 'opt1', name: 'Color', values: ['Black', 'White', 'Red']},
    {id: 'opt2', name: 'Size', values: ['S', 'M', 'L']},
  ];

  const mockSelections = {Color: 'Black', Size: 'M'};

  const mockAvailability = {
    Color: {Black: true, White: true, Red: false},
    Size: {S: true, M: true, L: false},
  };

  const mockOnSelectOption = jest.fn();

  beforeEach(() => {
    mockOnSelectOption.mockClear();
  });

  it('renders all option groups', () => {
    const {getByText} = render(
      <VariantSelector
        options={mockOptions}
        selectedOptions={mockSelections}
        optionAvailability={mockAvailability}
        onSelectOption={mockOnSelectOption}
      />,
    );

    expect(getByText('Color')).toBeTruthy();
    expect(getByText('Size')).toBeTruthy();
  });

  it('renders all option values', () => {
    const {getByText} = render(
      <VariantSelector
        options={mockOptions}
        selectedOptions={mockSelections}
        optionAvailability={mockAvailability}
        onSelectOption={mockOnSelectOption}
      />,
    );

    // Color values
    expect(getByText('Black')).toBeTruthy();
    expect(getByText('White')).toBeTruthy();
    expect(getByText('Red')).toBeTruthy();

    // Size values
    expect(getByText('S')).toBeTruthy();
    expect(getByText('M')).toBeTruthy();
    expect(getByText('L')).toBeTruthy();
  });

  it('calls onSelectOption when available option is pressed', () => {
    const {getByText} = render(
      <VariantSelector
        options={mockOptions}
        selectedOptions={mockSelections}
        optionAvailability={mockAvailability}
        onSelectOption={mockOnSelectOption}
      />,
    );

    // White is available
    fireEvent.press(getByText('White'));
    expect(mockOnSelectOption).toHaveBeenCalledWith('Color', 'White');
  });

  it('does not call onSelectOption for unavailable (disabled) options', () => {
    const {getByText} = render(
      <VariantSelector
        options={mockOptions}
        selectedOptions={mockSelections}
        optionAvailability={mockAvailability}
        onSelectOption={mockOnSelectOption}
      />,
    );

    // Red is unavailable (disabled)
    fireEvent.press(getByText('Red'));
    expect(mockOnSelectOption).not.toHaveBeenCalled();
  });

  it('renders accessibility labels for options', () => {
    const {getByLabelText} = render(
      <VariantSelector
        options={mockOptions}
        selectedOptions={mockSelections}
        optionAvailability={mockAvailability}
        onSelectOption={mockOnSelectOption}
      />,
    );

    // Check for accessibility labels on available items
    expect(getByLabelText('Black')).toBeTruthy();
    expect(getByLabelText('White')).toBeTruthy();
    expect(getByLabelText('M')).toBeTruthy();
  });

  it('indicates unavailable options in accessibility label', () => {
    const {getByLabelText} = render(
      <VariantSelector
        options={mockOptions}
        selectedOptions={mockSelections}
        optionAvailability={mockAvailability}
        onSelectOption={mockOnSelectOption}
      />,
    );

    // Red and L are unavailable
    expect(getByLabelText('Red, unavailable')).toBeTruthy();
    expect(getByLabelText('L, unavailable')).toBeTruthy();
  });

  it('handles empty options array', () => {
    const {queryByText} = render(
      <VariantSelector
        options={[]}
        selectedOptions={{}}
        optionAvailability={{}}
        onSelectOption={mockOnSelectOption}
      />,
    );

    expect(queryByText('Color')).toBeNull();
    expect(queryByText('Size')).toBeNull();
  });

  it('handles single option group', () => {
    const singleOption: ProductOption[] = [
      {id: 'opt1', name: 'Size', values: ['S', 'M']},
    ];

    const {getByText, queryByText} = render(
      <VariantSelector
        options={singleOption}
        selectedOptions={{Size: 'S'}}
        optionAvailability={{Size: {S: true, M: true}}}
        onSelectOption={mockOnSelectOption}
      />,
    );

    expect(getByText('Size')).toBeTruthy();
    expect(getByText('S')).toBeTruthy();
    expect(getByText('M')).toBeTruthy();
    expect(queryByText('Color')).toBeNull();
  });
});
