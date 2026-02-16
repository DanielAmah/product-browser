import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {EmptyState} from '../../components/EmptyState';

describe('EmptyState', () => {
  it('shows title and message', () => {
    const {getByText} = render(
      <EmptyState title="No results" message="Try a different search." />,
    );
    expect(getByText('No results')).toBeDefined();
    expect(getByText('Try a different search.')).toBeDefined();
  });

  it('renders an action button when actionLabel + onAction are provided', () => {
    const onAction = jest.fn();
    const {getByText} = render(
      <EmptyState
        title="Empty"
        message="Nothing here"
        actionLabel="Browse Products"
        onAction={onAction}
      />,
    );
    fireEvent.press(getByText('Browse Products'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('hides the button when no action props are given', () => {
    const {queryByText} = render(
      <EmptyState title="Empty" message="Nope" />,
    );
    expect(queryByText('Browse Products')).toBeNull();
  });
});
