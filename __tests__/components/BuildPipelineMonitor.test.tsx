// Fix: Import jest-dom to extend Jest's expect with DOM matchers.
import '@testing-library/jest-dom';
import React from 'react';
// Fix: Import `screen` directly from `@testing-library/react` to resolve module issue.
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import userEvent from '@testing-library/user-event';
import BuildPipelineMonitor from '../../components/BuildPipelineMonitor';
import { useBuildLogs } from '../../hooks/useBuildLogs';
import type { Build } from '../../types';

jest.mock('../../hooks/useBuildLogs', () => ({
  useBuildLogs: jest.fn(),
}));

jest.mock('../../components/QuantumBuildVisualizer', () => ({
  QuantumBuildVisualizer: () => <div data-testid="quantum-visualizer">QuantumBuild™ Live</div>,
}));


const mockUseBuildLogs = useBuildLogs as jest.Mock;

const mockBuilds: Build[] = [
  {
    id: 'build-1',
    ideaId: 'idea-1',
    ideaTitle: 'Successful App',
    status: 'success',
    startedAt: new Date('2023-10-27T10:00:00Z').toISOString(),
    completedAt: new Date('2023-10-27T10:05:00Z').toISOString(),
    logs: ['Success!'],
    testResults: { total: 100, passed: 100, failed: 0, coverage: 98 },
    stagingUrl: 'https://success.example.com',
  },
  {
    id: 'build-2',
    ideaId: 'idea-2',
    ideaTitle: 'Running App',
    status: 'running',
    startedAt: new Date().toISOString(),
    logs: ['Build started...'],
  },
  {
    id: 'build-3',
    ideaId: 'idea-3',
    ideaTitle: 'Failed App',
    status: 'failed',
    startedAt: new Date('2023-10-26T10:00:00Z').toISOString(),
    completedAt: new Date('2023-10-26T10:02:00Z').toISOString(),
    logs: ['Error during build.'],
  },
];

describe('BuildPipelineMonitor', () => {
  beforeEach(() => {
    mockUseBuildLogs.mockReturnValue({
      logs: ['Log line 1', 'Error: something failed'],
      isConnected: true,
    });
  });

  it('renders "No builds yet" message when builds array is empty', () => {
    renderWithProviders(<BuildPipelineMonitor builds={[]} />);
    expect(screen.getByText('No builds yet.')).toBeInTheDocument();
  });
  
  it('renders a list of builds, filtering running ones to the visualizer', () => {
    renderWithProviders(<BuildPipelineMonitor builds={mockBuilds} />);
    expect(screen.getByText('Successful App')).toBeInTheDocument();
    expect(screen.getByText('Failed App')).toBeInTheDocument();
    // Running app is in the visualizer
    expect(screen.getByTestId('quantum-visualizer')).toBeInTheDocument();
    // And its title should not be in a regular card
    expect(screen.queryByText('Running App')).not.toBeInTheDocument();
  });
  
  it('renders the QuantumBuildVisualizer for a running build', () => {
    renderWithProviders(<BuildPipelineMonitor builds={mockBuilds} />);
    expect(screen.getByTestId('quantum-visualizer')).toBeInTheDocument();
  });
  
  it('expands and collapses the logs section', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuildPipelineMonitor builds={[mockBuilds[2]]} />); // Only the failed build

    const viewLogsButton = screen.getByRole('button', { name: /View Live Logs/i });
    expect(screen.queryByText('Log line 1')).not.toBeInTheDocument();
    
    await user.click(viewLogsButton);
    
    expect(await screen.findByText('Log line 1')).toBeInTheDocument();
    expect(screen.getByText('Error: something failed')).toBeInTheDocument();
    
    const hideLogsButton = screen.getByRole('button', { name: /Hide Live Logs/i });
    await user.click(hideLogsButton);

    expect(screen.queryByText('Log line 1')).not.toBeInTheDocument();
  });
  
  it('displays test results for a successful build', () => {
    renderWithProviders(<BuildPipelineMonitor builds={[mockBuilds[0]]} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Coverage')).toBeInTheDocument();
    expect(screen.getByText('98%')).toBeInTheDocument();
  });
});