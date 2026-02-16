import React from 'react';
import {render} from '@testing-library/react-native';
import {OfflineBanner} from '../../components/OfflineBanner';

test('shows offline text and is announced as an alert', () => {
  const {getByText, getByLabelText} = render(<OfflineBanner />);

  expect(getByText("You're offline")).toBeDefined();

  const banner = getByLabelText(/offline/i);
  expect(banner.props.accessibilityRole).toBe('alert');
});
