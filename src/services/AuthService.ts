import UserModel, { CreateUserData, LoginCredentials, UserProfile } from '../models/User';
import SessionModel, { CreateSessionData } from '../models/Session';
import { validatePassword, verifyToken } from '../auth/utils';

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

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  token?: string;
  message?: string;
  errors?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class AuthService {
  private userModel = new UserModel();
  private sessionModel = new SessionModel();

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Validate input
      const validation = this.validateRegistrationData(data);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        };
      }

      // Create user
      const userData: CreateUserData = {
        email: data.email,
        username: data.username,
        password: data.password,
      };

      const user = await this.userModel.createUser(userData);

      // Create session
      const sessionData: CreateSessionData = {
        userId: user.id,
        userEmail: user.email,
      };

      const { token } = this.sessionModel.createSession(sessionData);

      return {
        success: true,
        user,
        token,
        message: 'User registered successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResult> {
    try {
      // Validate input
      if (!data.emailOrUsername || !data.password) {
        return {
          success: false,
          message: 'Email/username and password are required',
        };
      }

      // Authenticate user
      const credentials: LoginCredentials = {
        emailOrUsername: data.emailOrUsername,
        password: data.password,
      };

      const user = await this.userModel.authenticateUser(credentials);
      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials',
        };
      }

      // Create session
      const sessionData: CreateSessionData = {
        userId: user.id,
        userEmail: user.email,
      };

      const { token } = this.sessionModel.createSession(sessionData);

      return {
        success: true,
        user,
        token,
        message: 'Login successful',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Logout user
   */
  logout(token: string): AuthResult {
    try {
      const success = this.sessionModel.deleteSessionByToken(token);
      
      return {
        success,
        message: success ? 'Logout successful' : 'Logout failed',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Logout failed',
      };
    }
  }

  /**
   * Logout from all devices
   */
  logoutAll(userId: string): AuthResult {
    try {
      const success = this.sessionModel.deleteAllUserSessions(userId);
      
      return {
        success,
        message: success ? 'Logged out from all devices' : 'Logout failed',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Logout failed',
      };
    }
  }

  /**
   * Validate session and get user
   */
  validateSession(token: string): { isValid: boolean; user?: UserProfile } {
    try {
      // Validate token format and decode
      const decoded = verifyToken(token);
      if (!decoded) {
        return { isValid: false };
      }

      // Check session in database
      const session = this.sessionModel.validateSession(token);
      if (!session) {
        return { isValid: false };
      }

      // Get user profile
      const user = this.userModel.findById(session.user_id);
      if (!user) {
        return { isValid: false };
      }

      return { isValid: true, user };
    } catch (error) {
      return { isValid: false };
    }
  }

  /**
   * Get user profile by ID
   */
  getUserProfile(userId: string): UserProfile | null {
    return this.userModel.findById(userId);
  }

  /**
   * Update user profile
   */
  updateProfile(userId: string, updates: Partial<Pick<UserProfile, 'email' | 'username'>>): AuthResult {
    try {
      const user = this.userModel.updateUser(userId, updates);
      
      return {
        success: true,
        user: user || undefined,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Profile update failed',
      };
    }
  }

  /**
   * Validate registration data
   */
  private validateRegistrationData(data: RegisterData): ValidationResult {
    const errors: string[] = [];

    // Check required fields
    if (!data.email) errors.push('Email is required');
    if (!data.username) errors.push('Username is required');
    if (!data.password) errors.push('Password is required');
    if (!data.confirmPassword) errors.push('Password confirmation is required');

    // Check password match
    if (data.password !== data.confirmPassword) {
      errors.push('Passwords do not match');
    }

    // Validate password strength
    if (data.password) {
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clean up expired sessions (maintenance)
   */
  cleanupExpiredSessions(): number {
    return this.sessionModel.cleanupAllExpiredSessions();
  }

  /**
   * Get user session count
   */
  getUserSessionCount(userId: string): number {
    return this.sessionModel.getUserSessionCount(userId);
  }

  /**
   * Extend session expiration
   */
  extendSession(token: string): boolean {
    const session = this.sessionModel.findByToken(token);
    if (!session) {
      return false;
    }
    
    return this.sessionModel.extendSession(session.id);
  }
}

export default AuthService;
