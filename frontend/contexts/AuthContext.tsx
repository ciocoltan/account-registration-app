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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
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
    // Attempt auto-login on app load
    const attemptAutoLogin = async () => {
      try {
        const response = await backend.auth.autoLogin({});
        
        if (response.success && response.jwt && response.user && response.access_token) {
          const newAuthData: AuthData = {
            user: response.user,
            accessToken: response.access_token,
            jwt: response.jwt
          };
          
          setAuthData(newAuthData);
          setIsAuthenticated(true);
          console.log('Auto-login successful');
        }
      } catch (error: any) {
        console.log('Auto-login failed or no saved credentials:', error.message);
        // Clear any invalid cookies
        try {
          await backend.auth.clearLoginCookie();
        } catch (clearError) {
          console.log('Failed to clear login cookie:', clearError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    attemptAutoLogin();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
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

        // If remember me is checked, set the login cookie
        if (rememberMe) {
          try {
            await backend.auth.setLoginCookie({
              email,
              password
            });
            console.log('Login cookie set for remember me');
          } catch (cookieError) {
            console.error('Failed to set login cookie:', cookieError);
            // Don't fail the login if cookie setting fails
          }
        }
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

      // Then immediately login to get the access token (with remember me enabled by default)
      await login(email, password, true);
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear the login cookie first
      await backend.auth.clearLoginCookie();
      
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
