import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import backend from '~backend/client';

interface AuthData {
  user: string;
  accessToken: string;
  jwt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  authData: AuthData | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, currency: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // No session restoration from localStorage - users need to login again
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await backend.auth.login({
        email,
        password
      });

      if (response.jwt && response.user && response.access_token) {
        const newAuthData: AuthData = {
          user: response.user,
          accessToken: response.access_token,
          jwt: response.jwt
        };
        
        setAuthData(newAuthData);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, currency: string) => {
    try {
      // First register the user
      const registerResponse = await backend.auth.register({
        email,
        password,
        currency
      });

      console.log('Registration successful:', registerResponse.message);

      // Then immediately login to get the access token
      await login(email, password);
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (authData?.user && authData?.accessToken) {
        await backend.auth.logout({
          user: authData.user,
          access_token: authData.accessToken
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear all auth data
      setAuthData(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      authData,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
