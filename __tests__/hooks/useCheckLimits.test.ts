import { renderHook, act } from '@testing-library/react';
import { useCheckLimits, CheckLimitResponse } from '../../hooks/useCheckLimits';
import { api } from '../../lib/api';
import type { UserUsage, UserLimits } from '../../types';

// Mock the API module
jest.mock('../../lib/api');
// Fix: Removed the generic from the Mock type assertion to fix a constraint error.
const mockApiPost = api.post as jest.Mock;

const mockUsage: UserUsage = { ideasGenerated: 0, buildsStarted: 0, activeProjects: 0, storageUsed: 0, bandwidthUsed: 0 };
const mockLimits: UserLimits = { ideasPerMonth: 5, buildsPerMonth: 2, maxActiveProjects: 1, storageLimit: 1, bandwidthLimit: 5, seats: 1 };

describe('useCheckLimits', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return canProceed: true when limit is not reached', async () => {
    const mockResponse: CheckLimitResponse = { canProceed: true, reason: '', usage: mockUsage, limits: mockLimits, plan: 'free' };
    mockApiPost.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCheckLimits());
    
    let response;
    await act(async () => {
      response = await result.current.checkLimit('generate_idea', 'user1');
    });

    expect(mockApiPost).toHaveBeenCalledWith('/api/check-limits', { userId: 'user1', action: 'generate_idea' });
    expect(response).toEqual(mockResponse);
    expect(result.current.checking).toBe(false);
  });

  it('should return canProceed: false when limit is reached', async () => {
    const mockResponse: CheckLimitResponse = { canProceed: false, reason: 'Limit reached', usage: mockUsage, limits: mockLimits, plan: 'free' };
    mockApiPost.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCheckLimits());

    let response;
    await act(async () => {
      response = await result.current.checkLimit('start_build', 'user2');
    });

    expect(mockApiPost).toHaveBeenCalledWith('/api/check-limits', { userId: 'user2', action: 'start_build' });
    expect(response).toEqual(mockResponse);
  });
  
  it('should set checking state to true during the fetch', async () => {
    const mockResponse: CheckLimitResponse = { canProceed: true, reason: '', usage: mockUsage, limits: mockLimits, plan: 'free' };
    mockApiPost.mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useCheckLimits());

    let promise: Promise<any>;
    act(() => {
        promise = result.current.checkLimit('generate_idea', 'user1');
    });

    expect(result.current.checking).toBe(true);

    await act(async () => {
        await promise;
    });

    expect(result.current.checking).toBe(false);
  });
  
  it('should return null if the API call fails', async () => {
    mockApiPost.mockRejectedValue(new Error('API Error'));
    
    const { result } = renderHook(() => useCheckLimits());

    let response;
    await act(async () => {
      response = await result.current.checkLimit('generate_idea', 'user1');
    });
    
    expect(response).toBeNull();
    expect(result.current.checking).toBe(false);
  });
});