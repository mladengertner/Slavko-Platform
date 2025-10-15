// Fix: Import jest-dom to extend Jest's expect with DOM matchers.
import '@testing-library/jest-dom';
import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { PaywallModal } from '../../components/PaywallModal';

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  message: "You've hit your idea limit.",
  usage: {
    ideasGenerated: 5,
    buildsStarted: 8,
    activeProjects: 1,
    storageUsed: 0,
    bandwidthUsed: 0,
  },
  limits: {
    ideasPerMonth: 5,
    buildsPerMonth: 8,
    maxActiveProjects: 1,
    storageLimit: 10,
    bandwidthLimit: 50,
    seats: 1,
  },
};

describe('PaywallModal', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when open prop is false', () => {
    const { container } = renderWithProviders(<PaywallModal {...defaultProps} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render correctly with all props', () => {
    renderWithProviders(<PaywallModal {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Upgrade to Unleash More Power' })).toBeInTheDocument();
    expect(screen.getByText("You've hit your idea limit.")).toBeInTheDocument();

    // Check if usage details are displayed
    expect(screen.getByText('Ideas:')).toBeInTheDocument();
    expect(screen.getByText('5/5')).toBeInTheDocument();
    expect(screen.getByText('Builds:')).toBeInTheDocument();
    expect(screen.getByText('8/8')).toBeInTheDocument();
    expect(screen.getByText('Projects:')).toBeInTheDocument();
    expect(screen.getByText('1/1')).toBeInTheDocument();
  });

  it('should render without usage details if they are not provided', () => {
    renderWithProviders(<PaywallModal {...defaultProps} usage={null} limits={null} />);
    
    expect(screen.queryByText('Your Current Usage:')).not.toBeInTheDocument();
  });

  it('should call onClose when "Maybe Later" button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaywallModal {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: 'Maybe Later' });
    await user.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaywallModal {...defaultProps} />);
    
    // The backdrop is the root div with role="dialog"
    // userEvent.click simulates a more realistic click than fireEvent
    await user.click(screen.getByRole('dialog'));
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
  
  it('should not call onClose when the modal content is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaywallModal {...defaultProps} />);
    
    // Get the main content div and click it
    await user.click(screen.getByText("You've hit your idea limit."));
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
  
  it('should have an upgrade link pointing to the pricing page', () => {
    renderWithProviders(<PaywallModal {...defaultProps} />);
    
    const upgradeLink = screen.getByRole('link', { name: /Upgrade to Founder/i });
    expect(upgradeLink).toBeInTheDocument();
    expect(upgradeLink).toHaveAttribute('href', '#/pricing');
  });
});