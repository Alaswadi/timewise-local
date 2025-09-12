import { getDatabase } from '../database/config';
import { hashPassword, verifyPassword, validateEmail, validateUsername, sanitizeInput } from '../auth/utils';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

export class UserModel {
  private db = getDatabase();

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserData): Promise<UserProfile> {
    const { email, username, password } = userData;

    // Validate input
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!validateUsername(username)) {
      throw new Error('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
    }

    // Sanitize input
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedUsername = sanitizeInput(username.toLowerCase());

    // Check if user already exists
    const existingUser = this.findByEmailOrUsername(sanitizedEmail, sanitizedUsername);
    if (existingUser) {
      if (existingUser.email === sanitizedEmail) {
        throw new Error('Email already exists');
      }
      if (existingUser.username === sanitizedUsername) {
        throw new Error('Username already exists');
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, username, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(userId, sanitizedEmail, sanitizedUsername, passwordHash, now, now);
      
      // Return user profile (without password hash)
      return {
        id: userId,
        email: sanitizedEmail,
        username: sanitizedUsername,
        created_at: now,
        updated_at: now,
      };
    } catch (error) {
      throw new Error('Failed to create user');
    }
  }

  /**
   * Authenticate user login
   */
  async authenticateUser(credentials: LoginCredentials): Promise<UserProfile | null> {
    const { emailOrUsername, password } = credentials;
    
    // Sanitize input
    const sanitizedInput = sanitizeInput(emailOrUsername.toLowerCase());
    
    // Find user by email or username
    const user = this.findByEmailOrUsername(sanitizedInput, sanitizedInput);
    if (!user) {
      return null;
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    // Return user profile (without password hash)
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  /**
   * Find user by email or username
   */
  findByEmailOrUsername(email: string, username: string): User | null {
    const stmt = this.db.prepare(`
      SELECT * FROM users 
      WHERE email = ? OR username = ?
      LIMIT 1
    `);

    try {
      const user = stmt.get(email, username) as User | undefined;
      return user || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find user by ID
   */
  findById(userId: string): UserProfile | null {
    const stmt = this.db.prepare(`
      SELECT id, email, username, created_at, updated_at 
      FROM users 
      WHERE id = ?
    `);

    try {
      const user = stmt.get(userId) as UserProfile | undefined;
      return user || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find user by email
   */
  findByEmail(email: string): UserProfile | null {
    const stmt = this.db.prepare(`
      SELECT id, email, username, created_at, updated_at 
      FROM users 
      WHERE email = ?
    `);

    try {
      const user = stmt.get(email) as UserProfile | undefined;
      return user || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update user profile
   */
  updateUser(userId: string, updates: Partial<Pick<User, 'email' | 'username'>>): UserProfile | null {
    const user = this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.email) {
      if (!validateEmail(updates.email)) {
        throw new Error('Invalid email format');
      }
      updateFields.push('email = ?');
      updateValues.push(sanitizeInput(updates.email.toLowerCase()));
    }

    if (updates.username) {
      if (!validateUsername(updates.username)) {
        throw new Error('Invalid username format');
      }
      updateFields.push('username = ?');
      updateValues.push(sanitizeInput(updates.username.toLowerCase()));
    }

    if (updateFields.length === 0) {
      return user;
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(userId);

    const stmt = this.db.prepare(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);

    try {
      stmt.run(...updateValues);
      return this.findById(userId);
    } catch (error) {
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete user
   */
  deleteUser(userId: string): boolean {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    
    try {
      const result = stmt.run(userId);
      return result.changes > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user count
   */
  getUserCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
    const result = stmt.get() as { count: number };
    return result.count;
  }
}

export default UserModel;
