import { useMemo } from 'react';
import backend from '~backend/client';
import { useAuth } from '../contexts/AuthContext';

export function useBackend() {
  const { authData, isAuthenticated } = useAuth();
  
  return useMemo(() => {
    if (!isAuthenticated || !authData) {
      return backend;
    }
    
    return backend.with({
      auth: async () => ({
        authorization: `Bearer ${authData.jwt}`
      })
    });
  }, [isAuthenticated, authData]);
}
