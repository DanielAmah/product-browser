import React from 'react';
import {Text} from 'react-native';
import {render, fireEvent} from '@testing-library/react-native';
import {ErrorBoundary} from '../../components/ErrorBoundary';

// Mutable flag — Bomb reads this at render time, not from props.
// This way, when ErrorBoundary resets and re-renders its children,
// the flag has already been flipped by the onReset callback.
let shouldThrow = false;

function Bomb() {
  if (shouldThrow) throw new Error('kaboom');
  return <Text>All good</Text>;
}

beforeEach(() => {
  shouldThrow = false;
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const {getByText} = render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(getByText('All good')).toBeDefined();
  });

  it('catches render errors and shows the fallback', () => {
    shouldThrow = true;
    const {getByText, queryByText} = render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(getByText('Something went wrong')).toBeDefined();
    expect(queryByText('All good')).toBeNull();
  });

  it('recovers when the user presses "Try Again"', () => {
    shouldThrow = true;
    const reset = jest.fn(() => {
      shouldThrow = false;
    });

    const {getByLabelText, getByText} = render(
      <ErrorBoundary onReset={reset}>
        <Bomb />
      </ErrorBoundary>,
    );

    // boundary caught the error
    expect(getByText('Something went wrong')).toBeDefined();

    fireEvent.press(getByLabelText('Try again'));
    expect(reset).toHaveBeenCalledTimes(1);

    // after reset, Bomb no longer throws
    expect(getByText('All good')).toBeDefined();
  });

  it('expands error details on toggle', () => {
    shouldThrow = true;
    const {getByText, queryByText} = render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(queryByText('kaboom')).toBeNull();

    fireEvent.press(getByText('What happened?'));
    expect(getByText('kaboom')).toBeDefined();

    fireEvent.press(getByText('Hide details'));
    expect(queryByText('kaboom')).toBeNull();
  });
});
