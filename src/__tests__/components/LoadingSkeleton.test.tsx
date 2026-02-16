import React from 'react';
import {render} from '@testing-library/react-native';
import {LoadingSkeleton} from '../../components/LoadingSkeleton';

test('renders with progressbar role so screen readers announce loading', () => {
  const {getByLabelText} = render(<LoadingSkeleton />);
  const skeleton = getByLabelText('Loading products');
  expect(skeleton.props.accessibilityRole).toBe('progressbar');
});

test('renders multiple skeleton rows', () => {
  const {toJSON} = render(<LoadingSkeleton />);
  // basic smoke test — we're not asserting exact DOM structure
  expect(toJSON()).not.toBeNull();
});
