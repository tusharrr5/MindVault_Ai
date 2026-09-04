import { useAuth } from '@/context/AuthContext';
import { useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useApi() {
  const { getToken } = useAuth();

  const fetchApi = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.message || 'API Error');
    }
    
    return data;
  }, [getToken]);

  return { fetchApi };
}
