// Fix: Import jest-dom to extend Jest's expect with DOM matchers.
import '@testing-library/jest-dom';
import React from 'react';
// Fix: Import `screen` directly from `@testing-library/react` to resolve module issue.
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import { StatCard } from '../../components/StatCard';
import { SparklesIcon } from '../../components/icons';

describe('StatCard', () => {
  it('renders correctly with given props', () => {
    const props = {
      title: 'Ideas Generated',
      value: '123',
      icon: <SparklesIcon />,
      iconColorClass: 'text-yellow-400',
    };

    renderWithProviders(<StatCard {...props} />);

    // Check if title and value are displayed
    expect(screen.getByText('Ideas Generated')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();

    // Check if the icon container has the correct color class
    const iconContainer = screen.getByText('123').parentElement?.previousElementSibling;
    expect(iconContainer).toHaveClass('text-yellow-400');
  });
});