import { jest } from '@jest/globals';
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ToastProvider } from '../hooks/useToast';
import { AuthContext, AuthContextType } from '../contexts/AuthContext';
import type { UserProfile } from '../types';

// Mock values for AuthContext
const mockAuthContextValue: AuthContextType = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    plan: 'founder',
    role: 'owner',
    usage: { ideasGenerated: 0, buildsStarted: 0, activeProjects: 0, storageUsed: 0, bandwidthUsed: 0 },
    limits: { ideasPerMonth: 50, buildsPerMonth: 20, maxActiveProjects: 5, storageLimit: 10, bandwidthLimit: 50, seats: 1 },
  } as UserProfile,
  loading: false,
  authModalOpen: false,
  setAuthModalOpen: jest.fn(),
  signInWithGoogle: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  signOutUser: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  updateUserProfile: jest.fn<(data: Partial<Omit<UserProfile, 'id'>>) => Promise<void>>().mockResolvedValue(undefined),
};


// A version with customizable context
const renderWithProviders = (
  ui: ReactElement,
  {
    providerProps = {},
    ...renderOptions
  }: { providerProps?: Partial<AuthContextType>, [key: string]: any } = {}
) => {
  const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <ToastProvider>
      <AuthContext.Provider value={{ ...mockAuthContextValue, ...providerProps }}>
        {children}
      </AuthContext.Provider>
    </ToastProvider>
  );
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};


export * from '@testing-library/react';
export { renderWithProviders };