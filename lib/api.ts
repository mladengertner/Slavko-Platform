import { auth } from './firebaseConfig';

// Custom error class for API-specific errors
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const getHeaders = async (): Promise<HeadersInit> => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const user = auth.currentUser;
    if (user) {
        try {
            const token = await user.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
        } catch (error) {
            console.error("Error getting auth token:", error);
        }
    }
    return headers;
};


// Centralized API client
export const api = {
  /**
   * Performs a GET request to the specified endpoint.
   * @param endpoint The API endpoint to call (e.g., "/api/users").
   * @returns The JSON response from the server.
   * @throws {ApiError} If the server response is not OK, containing the error message from the server.
   */
  get: async <T>(endpoint: string): Promise<T> => {
    const headers = await getHeaders();
    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'An unexpected server error occurred.' }));
      throw new ApiError(errorData.error || 'Failed to fetch from API.');
    }

    return response.json();
  },

  /**
   * Performs a POST request to the specified endpoint.
   * @param endpoint The API endpoint to call (e.g., "/api/ideas/generate").
   * @param body The JSON body to send with the request.
   * @returns The JSON response from the server.
   * @throws {ApiError} If the server response is not OK, containing the error message from the server.
   */
  post: async <T>(endpoint: string, body: Record<string, unknown>): Promise<T> => {
    const headers = await getHeaders();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Try to parse the error response from the backend, otherwise provide a fallback.
      const errorData = await response.json().catch(() => ({ error: 'An unexpected server error occurred.' }));
      throw new ApiError(errorData.error || 'Failed to fetch from API.');
    }

    return response.json();
  },
};