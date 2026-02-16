import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {ErrorState} from '../../components/ErrorState';

test('renders the error message and a retry button', () => {
  const retry = jest.fn();
  const {getByText, getByLabelText} = render(
    <ErrorState message="Network timeout" onRetry={retry} />,
  );

  expect(getByText('Network timeout')).toBeDefined();
  expect(getByText('Something went wrong')).toBeDefined();

  fireEvent.press(getByLabelText('Try again'));
  expect(retry).toHaveBeenCalledTimes(1);
});
