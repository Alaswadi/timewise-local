import AuthService, { RegisterData, LoginData } from '../services/AuthService';
import { initializeDatabase } from '../database/config';

// Initialize database when the module is loaded
initializeDatabase();

const authService = new AuthService();

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface AuthApiResponse extends ApiResponse {
  data?: {
    user?: any;
    token?: string;
  };
}

/**
 * Mock API endpoint for user registration
 */
export const registerUser = async (data: RegisterData): Promise<AuthApiResponse> => {
  try {
    const result = await authService.register(data);
    
    if (result.success) {
      return {
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
        message: result.message,
      };
    } else {
      return {
        success: false,
        message: result.message,
        errors: result.errors,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Registration failed',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

/**
 * Mock API endpoint for user login
 */
export const loginUser = async (data: LoginData): Promise<AuthApiResponse> => {
  try {
    const result = await authService.login(data);
    
    if (result.success) {
      return {
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
        message: result.message,
      };
    } else {
      return {
        success: false,
        message: result.message,
        errors: result.errors,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Login failed',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

/**
 * Mock API endpoint for user logout
 */
export const logoutUser = async (token: string): Promise<ApiResponse> => {
  try {
    const result = authService.logout(token);
    
    return {
      success: result.success,
      message: result.message,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Logout failed',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

/**
 * Mock API endpoint for logout from all devices
 */
export const logoutAllDevices = async (userId: string): Promise<ApiResponse> => {
  try {
    const result = authService.logoutAll(userId);
    
    return {
      success: result.success,
      message: result.message,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Logout failed',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

/**
 * Mock API endpoint for getting current user profile
 */
export const getCurrentUser = async (token: string): Promise<AuthApiResponse> => {
  try {
    const validation = authService.validateSession(token);
    
    if (validation.isValid && validation.user) {
      return {
        success: true,
        data: {
          user: validation.user,
        },
        message: 'User profile retrieved successfully',
      };
    } else {
      return {
        success: false,
        message: 'Invalid or expired session',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to get user profile',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

/**
 * Mock API endpoint for updating user profile
 */
export const updateUserProfile = async (
  token: string, 
  updates: { email?: string; username?: string }
): Promise<AuthApiResponse> => {
  try {
    const validation = authService.validateSession(token);
    
    if (!validation.isValid || !validation.user) {
      return {
        success: false,
        message: 'Invalid or expired session',
      };
    }

    const result = authService.updateProfile(validation.user.id, updates);
    
    if (result.success) {
      return {
        success: true,
        data: {
          user: result.user,
        },
        message: result.message,
      };
    } else {
      return {
        success: false,
        message: result.message,
        errors: result.errors,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Profile update failed',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

/**
 * Mock API endpoint for validating session
 */
export const validateSession = async (token: string): Promise<AuthApiResponse> => {
  try {
    const validation = authService.validateSession(token);
    
    return {
      success: validation.isValid,
      data: validation.isValid ? { user: validation.user } : undefined,
      message: validation.isValid ? 'Session is valid' : 'Invalid or expired session',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Session validation failed',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

/**
 * Mock API endpoint for extending session
 */
export const extendSession = async (token: string): Promise<ApiResponse> => {
  try {
    const success = authService.extendSession(token);
    
    return {
      success,
      message: success ? 'Session extended successfully' : 'Failed to extend session',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Session extension failed',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

// Export the auth service for direct use if needed
export { authService };

// Cleanup function for expired sessions (can be called periodically)
export const cleanupExpiredSessions = (): number => {
  return authService.cleanupExpiredSessions();
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  logoutAllDevices,
  getCurrentUser,
  updateUserProfile,
  validateSession,
  extendSession,
  cleanupExpiredSessions,
};
