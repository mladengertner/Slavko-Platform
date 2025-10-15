// Fix: Import jest-dom to extend Jest's expect with DOM matchers.
import '@testing-library/jest-dom';
import React from 'react';
// Fix: Import `screen` directly from `@testing-library/react` to resolve module issue.
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { IdeaCard } from '../../components/IdeaCard';
import { useToast } from '../../hooks/useToast';
import { useCheckLimits, CheckLimitResponse } from '../../hooks/useCheckLimits';
import { api } from '../../lib/api';
import type { Idea, UserUsage, UserLimits } from '../../types';

// Mock dependencies
jest.mock('../../hooks/useToast', () => ({
  useToast: jest.fn(),
}));

jest.mock('../../hooks/useCheckLimits', () => ({
  useCheckLimits: jest.fn(),
}));

jest.mock('../../lib/api', () => ({
  api: {
    post: jest.fn(),
  },
}));

const mockUseToast = useToast as jest.Mock;
const mockUseCheckLimits = useCheckLimits as jest.Mock;
const mockApiPost = api.post as jest.Mock;

const mockUsage: UserUsage = { ideasGenerated: 0, buildsStarted: 0, activeProjects: 0, storageUsed: 0, bandwidthUsed: 0 };
const mockLimits: UserLimits = { ideasPerMonth: 5, buildsPerMonth: 2, maxActiveProjects: 1, storageLimit: 1, bandwidthLimit: 5, seats: 1 };

const mockIdeaPending: Idea = {
  id: 'idea-1',
  title: 'AI-Powered Note Taker',
  description: 'A revolutionary app for taking notes.',
  slavkoScore: 9,
  status: 'pending',
  problem: '',
  solution: '',
  targetAudience: '',
  techStack: [],
  features: [],
  monetization: '',
  marketSize: '',
  competitors: [],
  createdAt: new Date().toISOString(),
};

const mockIdeaDeployed: Idea = {
  ...mockIdeaPending,
  id: 'idea-2',
  title: 'Live SaaS Product',
  status: 'deployed',
  productionUrl: 'https://example.com',
};


describe('IdeaCard', () => {
  let mockToast: { success: jest.Mock; error: jest.Mock; info: jest.Mock };

  beforeEach(() => {
    mockToast = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    };
    mockUseToast.mockReturnValue({ toast: mockToast });
    mockUseCheckLimits.mockReturnValue({ checkLimit: jest.fn().mockResolvedValue({ canProceed: true, reason: '', usage: mockUsage, limits: mockLimits, plan: 'free' } as CheckLimitResponse), checking: false });
    mockApiPost.mockClear();
  });

  it('renders a pending idea correctly', () => {
    // Fix: Pass a correctly typed no-op function for onLimitReached when it's not being tested.
    renderWithProviders(<IdeaCard idea={mockIdeaPending} onShowScore={jest.fn()} onLimitReached={jest.fn<(result: CheckLimitResponse) => void>()} />);

    expect(screen.getByText('AI-Powered Note Taker')).toBeInTheDocument();
    expect(screen.getByText('⭐ 9/10')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Approve & Build/i })).toBeInTheDocument();
  });

  it('renders a deployed idea correctly', () => {
    renderWithProviders(<IdeaCard idea={mockIdeaDeployed} onShowScore={jest.fn()} onLimitReached={jest.fn()} />);

    expect(screen.getByText('Live SaaS Product')).toBeInTheDocument();
    expect(screen.getByText('deployed')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /View Live App/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('calls onShowScore when the score badge is clicked', async () => {
    const onShowScoreMock = jest.fn();
    renderWithProviders(<IdeaCard idea={mockIdeaPending} onShowScore={onShowScoreMock} onLimitReached={jest.fn()} />);
    
    await userEvent.click(screen.getByText('⭐ 9/10'));
    
    expect(onShowScoreMock).toHaveBeenCalledWith(mockIdeaPending);
  });
  
  it('handles "Approve & Build" click and shows success toast', async () => {
    const user = userEvent.setup();
    renderWithProviders(<IdeaCard idea={mockIdeaPending} onShowScore={jest.fn()} onLimitReached={jest.fn()} />);
    
    const approveButton = screen.getByRole('button', { name: /Approve & Build/i });
    await user.click(approveButton);
    
    expect(mockApiPost).toHaveBeenCalledWith('/api/builds/start', expect.any(Object));
    expect(mockToast.info).toHaveBeenCalledWith('Build for "AI-Powered Note Taker" has been queued!');
  });
  
  it('calls onLimitReached when build limit is exceeded', async () => {
    const user = userEvent.setup();
    // Fix: Explicitly type the mock function generic for better type inference.
    const onLimitReachedMock = jest.fn<(result: CheckLimitResponse) => void>();
    const limitResponse: CheckLimitResponse = { canProceed: false, reason: 'Limit reached', usage: mockUsage, limits: mockLimits, plan: 'free' };
    mockUseCheckLimits.mockReturnValue({ checkLimit: jest.fn().mockResolvedValue(limitResponse), checking: false });

    renderWithProviders(<IdeaCard idea={mockIdeaPending} onShowScore={jest.fn()} onLimitReached={onLimitReachedMock} />);
    
    await user.click(screen.getByRole('button', { name: /Approve & Build/i }));
    
    expect(onLimitReachedMock).toHaveBeenCalledWith(limitResponse);
    expect(mockApiPost).not.toHaveBeenCalled();
  });
});