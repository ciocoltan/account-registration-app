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
  register: (email: string, password: string, currency: string, countryCode: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }
  return null;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clear all user-specific localStorage data
  const clearAllUserData = () => {
    try {
      // Get all localStorage keys
      const keys = Object.keys(localStorage);
      
      // Clear form data and countries cache
      keys.forEach(key => {
        if (key.startsWith('form_data_') || key === 'countries_cache' || key === 'registration_country') {
          localStorage.removeItem(key);
        }
      });
      
      console.log('All user data cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear user data from localStorage:', error);
    }
  };

  useEffect(() => {
    // Attempt auto-login on app load
    const attemptAutoLogin = async () => {
      const loginCredsCookie = getCookie('login_creds');
      if (!loginCredsCookie) {
        console.log('No login credentials cookie found. Skipping auto-login.');
        setIsLoading(false);
        return;
      }

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
        // Clear all user data when auto-login fails
        clearAllUserData();
        
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

  const register = async (email: string, password: string, currency: string, countryCode: string) => {
    try {
      // Save country code and currency to localStorage for later use
      try {
        localStorage.setItem('registration_country', JSON.stringify({
          countryCode,
          currency,
          timestamp: Date.now()
        }));
        console.log('Registration country data saved to localStorage');
      } catch (storageError) {
        console.error('Failed to save registration country to localStorage:', storageError);
      }

      // Register the user with auto-login
      const registerResponse = await backend.auth.register({
        email,
        password,
        currency,
        countryCode
      });

      console.log('Registration successful:', registerResponse.message);

      if (registerResponse.success && registerResponse.jwt && registerResponse.user && registerResponse.access_token) {
        const newAuthData: AuthData = {
          user: registerResponse.user,
          accessToken: registerResponse.access_token,
          jwt: registerResponse.jwt
        };
        
        setAuthData(newAuthData);
        setIsAuthenticated(true);

        // Set login cookie for auto-login on future visits
        try {
          await backend.auth.setLoginCookie({
            email,
            password
          });
          console.log('Login cookie set after registration');
        } catch (cookieError) {
          console.error('Failed to set login cookie after registration:', cookieError);
          // Don't fail the registration if cookie setting fails
        }
      } else {
        throw new Error('Registration completed but auto-login failed');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear all user-specific data from localStorage
      clearAllUserData();

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
