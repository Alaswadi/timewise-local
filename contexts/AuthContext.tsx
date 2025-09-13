import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as authApi from '../api/auth';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  // State
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string, confirmPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateProfile: (updates: { email?: string; username?: string }) => Promise<boolean>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<boolean>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_KEY = 'timewise_auth_token';
const USER_KEY = 'timewise_user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Get token from localStorage
  const getStoredToken = useCallback((): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }, []);

  // Store token in localStorage
  const storeToken = useCallback((token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }, []);

  // Remove token from localStorage
  const removeToken = useCallback((): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }, []);

  // Store user in localStorage
  const storeUser = useCallback((userData: UserProfile): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to store user:', error);
    }
  }, []);

  // Get user from localStorage
  const getStoredUser = useCallback((): UserProfile | null => {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }, []);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Validate session and refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    const token = getStoredToken();
    console.log('🔍 Refreshing user, token exists:', !!token);

    if (!token) {
      console.log('❌ No token found, setting user to null');
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      console.log('📡 Validating session with API...');
      const response = await authApi.validateSession(token);
      console.log('📡 Session validation response:', response);

      if (response.success && response.data?.user) {
        console.log('✅ Session valid, user:', response.data.user.username);
        setUser(response.data.user);
        storeUser(response.data.user);
      } else {
        console.log('❌ Session invalid, clearing data');
        // Invalid session, clear stored data
        removeToken();
        setUser(null);
      }
    } catch (error) {
      console.error('💥 Session validation failed:', error);
      removeToken();
      setUser(null);
    } finally {
      console.log('🏁 Setting loading to false');
      setIsLoading(false);
    }
  }, [getStoredToken, storeUser, removeToken]);

  // Login function
  const login = useCallback(async (emailOrUsername: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.loginUser({ emailOrUsername, password });
      
      if (response.success && response.data?.user && response.data?.token) {
        setUser(response.data.user);
        storeToken(response.data.token);
        storeUser(response.data.user);
        return true;
      } else {
        setError(response.message || 'Login failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [storeToken, storeUser]);

  // Register function
  const register = useCallback(async (
    email: string, 
    username: string, 
    password: string, 
    confirmPassword: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.registerUser({ email, username, password, confirmPassword });
      
      if (response.success && response.data?.user && response.data?.token) {
        setUser(response.data.user);
        storeToken(response.data.token);
        storeUser(response.data.user);
        return true;
      } else {
        setError(response.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [storeToken, storeUser]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    const token = getStoredToken();
    
    if (token) {
      try {
        await authApi.logoutUser(token);
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }

    removeToken();
    setUser(null);
    setError(null);
  }, [getStoredToken, removeToken]);

  // Logout from all devices
  const logoutAll = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      await authApi.logoutAllDevices(user.id);
    } catch (error) {
      console.error('Logout all API call failed:', error);
    }

    removeToken();
    setUser(null);
    setError(null);
  }, [user, removeToken]);

  // Update profile function
  const updateProfile = useCallback(async (updates: { email?: string; username?: string }): Promise<boolean> => {
    const token = getStoredToken();
    if (!token) {
      setError('Not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.updateUserProfile(token, updates);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        storeUser(response.data.user);
        return true;
      } else {
        setError(response.message || 'Profile update failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getStoredToken, storeUser]);

  // Change password function
  const changePassword = useCallback(async (data: { currentPassword: string; newPassword: string }): Promise<boolean> => {
    const token = getStoredToken();
    if (!token) {
      setError('Not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.changeUserPassword(token, data);

      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Password change failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getStoredToken]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing auth...');

      // First, try to get user from localStorage for immediate UI update
      const storedUser = getStoredUser();
      if (storedUser) {
        console.log('👤 Found stored user:', storedUser.username);
        setUser(storedUser);
      } else {
        console.log('❌ No stored user found');
      }

      // Then validate the session
      console.log('🔍 Validating session...');
      await refreshUser();
      console.log('✅ Auth initialization complete');
    };

    initializeAuth();
  }, [refreshUser, getStoredUser]);

  // Auto-refresh session periodically (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshUser();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUser]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    logoutAll,
    updateProfile,
    changePassword,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
