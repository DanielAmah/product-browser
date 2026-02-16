import React from 'react';
import {render} from '@testing-library/react-native';
import {Badge} from '../../components/Badge';

describe('Badge', () => {
  it('renders nothing for count 0', () => {
    const {toJSON} = render(<Badge count={0} />);
    expect(toJSON()).toBeNull();
  });

  it('renders nothing for negative counts', () => {
    const {toJSON} = render(<Badge count={-3} />);
    expect(toJSON()).toBeNull();
  });

  it('shows the exact number for counts <= 99', () => {
    const {getByText} = render(<Badge count={7} />);
    expect(getByText('7')).toBeDefined();
  });

  it('caps the display at "99+" for triple-digit counts', () => {
    const {getByText} = render(<Badge count={120} />);
    expect(getByText('99+')).toBeDefined();
  });

  it('exposes cart item count in the a11y label', () => {
    const {getByLabelText} = render(<Badge count={3} />);
    expect(getByLabelText('3 items in cart')).toBeDefined();
  });
});
