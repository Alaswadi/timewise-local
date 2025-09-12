// Mock authentication API for browser environment
// This simulates the backend authentication system using localStorage

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface AuthApiResponse extends ApiResponse {
  data?: {
    user?: UserProfile;
    token?: string;
  };
}

// Simple validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Simple hash function for demo purposes (in production, use proper bcrypt)
const simpleHash = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
};

// Generate a simple token
const generateToken = (userId: string): string => {
  const timestamp = Date.now();
  return btoa(`${userId}:${timestamp}`);
};

// Verify token
const verifyToken = (token: string): { userId: string; timestamp: number } | null => {
  try {
    const decoded = atob(token);
    const [userId, timestamp] = decoded.split(':');
    return { userId, timestamp: parseInt(timestamp) };
  } catch {
    return null;
  }
};

// Storage keys
const USERS_KEY = 'timewise_users';
const SESSIONS_KEY = 'timewise_sessions';

// Get users from localStorage
const getUsers = (): any[] => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

// Save users to localStorage
const saveUsers = (users: any[]): void => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users:', error);
  }
};

// Get sessions from localStorage
const getSessions = (): any[] => {
  try {
    const sessions = localStorage.getItem(SESSIONS_KEY);
    return sessions ? JSON.parse(sessions) : [];
  } catch {
    return [];
  }
};

// Save sessions to localStorage
const saveSessions = (sessions: any[]): void => {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save sessions:', error);
  }
};

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Mock API endpoint for user registration
 */
export const registerUser = async (data: RegisterData): Promise<AuthApiResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const { email, username, password, confirmPassword } = data;
    const errors: string[] = [];

    // Validation
    if (!email) errors.push('Email is required');
    else if (!validateEmail(email)) errors.push('Invalid email format');

    if (!username) errors.push('Username is required');
    else if (!validateUsername(username)) errors.push('Username must be 3-20 characters long and contain only letters, numbers, and underscores');

    if (!password) errors.push('Password is required');
    else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: 'Validation failed',
        errors,
      };
    }

    // Check if user already exists
    const users = getUsers();
    const existingUser = users.find(u => u.email === email.toLowerCase() || u.username === username.toLowerCase());
    
    if (existingUser) {
      return {
        success: false,
        message: existingUser.email === email.toLowerCase() ? 'Email already exists' : 'Username already exists',
      };
    }

    // Create new user
    const userId = generateId();
    const now = new Date().toISOString();
    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password_hash: simpleHash(password),
      created_at: now,
      updated_at: now,
    };

    users.push(newUser);
    saveUsers(users);

    // Create session
    const token = generateToken(userId);
    const sessions = getSessions();
    sessions.push({
      id: generateId(),
      user_id: userId,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      created_at: now,
    });
    saveSessions(sessions);

    const userProfile: UserProfile = {
      id: userId,
      email: newUser.email,
      username: newUser.username,
      created_at: now,
      updated_at: now,
    };

    return {
      success: true,
      data: {
        user: userProfile,
        token,
      },
      message: 'User registered successfully',
    };
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
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const { emailOrUsername, password } = data;

    if (!emailOrUsername || !password) {
      return {
        success: false,
        message: 'Email/username and password are required',
      };
    }

    // Find user
    const users = getUsers();
    const user = users.find(u => 
      u.email === emailOrUsername.toLowerCase() || 
      u.username === emailOrUsername.toLowerCase()
    );

    if (!user || user.password_hash !== simpleHash(password)) {
      return {
        success: false,
        message: 'Invalid credentials',
      };
    }

    // Create session
    const token = generateToken(user.id);
    const sessions = getSessions();
    const now = new Date().toISOString();
    
    sessions.push({
      id: generateId(),
      user_id: user.id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      created_at: now,
    });
    saveSessions(sessions);

    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return {
      success: true,
      data: {
        user: userProfile,
        token,
      },
      message: 'Login successful',
    };
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
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  try {
    const sessions = getSessions();
    const filteredSessions = sessions.filter(s => s.token !== token);
    saveSessions(filteredSessions);

    return {
      success: true,
      message: 'Logout successful',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Logout failed',
    };
  }
};

/**
 * Mock API endpoint for logout from all devices
 */
export const logoutAllDevices = async (userId: string): Promise<ApiResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  try {
    const sessions = getSessions();
    const filteredSessions = sessions.filter(s => s.user_id !== userId);
    saveSessions(filteredSessions);

    return {
      success: true,
      message: 'Logged out from all devices',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Logout failed',
    };
  }
};

/**
 * Mock API endpoint for validating session
 */
export const validateSession = async (token: string): Promise<AuthApiResponse> => {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return {
        success: false,
        message: 'Invalid token',
      };
    }

    // Check if session exists and is not expired
    const sessions = getSessions();
    const session = sessions.find(s => s.token === token);
    
    if (!session || new Date(session.expires_at) < new Date()) {
      return {
        success: false,
        message: 'Session expired',
      };
    }

    // Get user
    const users = getUsers();
    const user = users.find(u => u.id === session.user_id);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return {
      success: true,
      data: {
        user: userProfile,
      },
      message: 'Session is valid',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Session validation failed',
    };
  }
};

/**
 * Mock API endpoint for changing user password
 */
export const changeUserPassword = async (
  token: string,
  data: { currentPassword: string; newPassword: string }
): Promise<ApiResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const validation = await validateSession(token);
    if (!validation.success || !validation.data?.user) {
      return {
        success: false,
        message: 'Invalid or expired session',
      };
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === validation.data!.user!.id);

    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    const user = users[userIndex];

    // Verify current password
    if (simpleHash(data.currentPassword) !== user.password_hash) {
      return {
        success: false,
        message: 'Current password is incorrect',
      };
    }

    // Validate new password
    if (!data.newPassword || data.newPassword.length < 6) {
      return {
        success: false,
        message: 'New password must be at least 6 characters long',
      };
    }

    // Update password
    users[userIndex].password_hash = simpleHash(data.newPassword);
    users[userIndex].updated_at = new Date().toISOString();

    saveUsers(users);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Password change failed',
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
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const validation = await validateSession(token);
    if (!validation.success || !validation.data?.user) {
      return {
        success: false,
        message: 'Invalid or expired session',
      };
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === validation.data!.user!.id);
    
    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Validate updates
    if (updates.email && !validateEmail(updates.email)) {
      return {
        success: false,
        message: 'Invalid email format',
      };
    }

    if (updates.username && !validateUsername(updates.username)) {
      return {
        success: false,
        message: 'Invalid username format',
      };
    }

    // Check for duplicates
    if (updates.email) {
      const existingUser = users.find(u => u.email === updates.email!.toLowerCase() && u.id !== validation.data!.user!.id);
      if (existingUser) {
        return {
          success: false,
          message: 'Email already exists',
        };
      }
    }

    if (updates.username) {
      const existingUser = users.find(u => u.username === updates.username!.toLowerCase() && u.id !== validation.data!.user!.id);
      if (existingUser) {
        return {
          success: false,
          message: 'Username already exists',
        };
      }
    }

    // Update user
    if (updates.email) {
      users[userIndex].email = updates.email.toLowerCase();
    }
    if (updates.username) {
      users[userIndex].username = updates.username.toLowerCase();
    }
    users[userIndex].updated_at = new Date().toISOString();

    saveUsers(users);

    const userProfile: UserProfile = {
      id: users[userIndex].id,
      email: users[userIndex].email,
      username: users[userIndex].username,
      created_at: users[userIndex].created_at,
      updated_at: users[userIndex].updated_at,
    };

    return {
      success: true,
      data: {
        user: userProfile,
      },
      message: 'Profile updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Profile update failed',
    };
  }
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  logoutAllDevices,
  validateSession,
  updateUserProfile,
  changeUserPassword,
};
