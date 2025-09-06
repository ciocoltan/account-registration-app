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

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to create user progress entry
function createUserProgress(email: string) {
  try {
    const progressKey = `user_progress_${email}`;
    const existingProgress = localStorage.getItem(progressKey);
    
    if (!existingProgress) {
      const initialProgress = {
        email,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        currentStep: 'personal-details',
        completedSteps: []
      };
      
      localStorage.setItem(progressKey, JSON.stringify(initialProgress));
      console.log('User progress entry created:', initialProgress);
    } else {
      // Update last login time
      const progress = JSON.parse(existingProgress);
      progress.lastLoginAt = new Date().toISOString();
      localStorage.setItem(progressKey, JSON.stringify(progress));
      console.log('User progress updated with last login time');
    }
  } catch (error) {
    console.error('Failed to create/update user progress:', error);
  }
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
        if ( key === 'registration_country' || key.startsWith('user_progress_')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('All user data cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear user data from localStorage:', error);
    }
  };

  useEffect(() => {
    // Attempt auto-login on app load. The browser will send the httpOnly cookie automatically.
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
          
          // Create/update user progress
          createUserProgress(response.user);
        }
      } catch (error: any) {
        console.log('Auto-login failed or no session cookie:', error.message);
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

        // Create user progress entry
        createUserProgress(response.user);

        // The cookie is set by the backend response automatically.
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

        // Create user progress entry
        createUserProgress(registerResponse.user);

        // The cookie is set by the backend response automatically.
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
