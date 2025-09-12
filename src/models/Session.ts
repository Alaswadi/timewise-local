import { getDatabase } from '../database/config';
import { generateSessionId, getSessionExpiration, generateToken } from '../auth/utils';

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface CreateSessionData {
  userId: string;
  userEmail: string;
}

export class SessionModel {
  private db = getDatabase();

  /**
   * Create a new session for a user
   */
  createSession(data: CreateSessionData): { session: Session; token: string } {
    const { userId, userEmail } = data;
    
    // Generate session data
    const sessionId = generateSessionId();
    const token = generateToken(userId, userEmail);
    const expiresAt = getSessionExpiration();
    const now = new Date().toISOString();

    // Clean up expired sessions for this user first
    this.cleanupExpiredSessions(userId);

    const stmt = this.db.prepare(`
      INSERT INTO sessions (id, user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(sessionId, userId, token, expiresAt.toISOString(), now);
      
      const session: Session = {
        id: sessionId,
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
        created_at: now,
      };

      return { session, token };
    } catch (error) {
      throw new Error('Failed to create session');
    }
  }

  /**
   * Find session by token
   */
  findByToken(token: string): Session | null {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions 
      WHERE token = ? AND expires_at > datetime('now')
    `);

    try {
      const session = stmt.get(token) as Session | undefined;
      return session || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find all active sessions for a user
   */
  findByUserId(userId: string): Session[] {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions 
      WHERE user_id = ? AND expires_at > datetime('now')
      ORDER BY created_at DESC
    `);

    try {
      return stmt.all(userId) as Session[];
    } catch (error) {
      return [];
    }
  }

  /**
   * Validate and refresh a session
   */
  validateSession(token: string): Session | null {
    const session = this.findByToken(token);
    if (!session) {
      return null;
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    if (now >= expiresAt) {
      // Session expired, delete it
      this.deleteSession(session.id);
      return null;
    }

    return session;
  }

  /**
   * Delete a specific session
   */
  deleteSession(sessionId: string): boolean {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE id = ?');
    
    try {
      const result = stmt.run(sessionId);
      return result.changes > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete session by token
   */
  deleteSessionByToken(token: string): boolean {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE token = ?');
    
    try {
      const result = stmt.run(token);
      return result.changes > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete all sessions for a user (logout from all devices)
   */
  deleteAllUserSessions(userId: string): boolean {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE user_id = ?');
    
    try {
      const result = stmt.run(userId);
      return result.changes >= 0; // Return true even if no sessions were deleted
    } catch (error) {
      return false;
    }
  }

  /**
   * Clean up expired sessions for a specific user
   */
  cleanupExpiredSessions(userId?: string): number {
    let stmt;
    let params: any[] = [];

    if (userId) {
      stmt = this.db.prepare(`
        DELETE FROM sessions 
        WHERE user_id = ? AND expires_at <= datetime('now')
      `);
      params = [userId];
    } else {
      stmt = this.db.prepare(`
        DELETE FROM sessions 
        WHERE expires_at <= datetime('now')
      `);
    }

    try {
      const result = stmt.run(...params);
      return result.changes;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Clean up all expired sessions (maintenance function)
   */
  cleanupAllExpiredSessions(): number {
    return this.cleanupExpiredSessions();
  }

  /**
   * Get session count for a user
   */
  getUserSessionCount(userId: string): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM sessions 
      WHERE user_id = ? AND expires_at > datetime('now')
    `);
    
    try {
      const result = stmt.get(userId) as { count: number };
      return result.count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get total active session count
   */
  getTotalSessionCount(): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM sessions 
      WHERE expires_at > datetime('now')
    `);
    
    try {
      const result = stmt.get() as { count: number };
      return result.count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Update session expiration (extend session)
   */
  extendSession(sessionId: string): boolean {
    const newExpiresAt = getSessionExpiration();
    
    const stmt = this.db.prepare(`
      UPDATE sessions 
      SET expires_at = ? 
      WHERE id = ? AND expires_at > datetime('now')
    `);

    try {
      const result = stmt.run(newExpiresAt.toISOString(), sessionId);
      return result.changes > 0;
    } catch (error) {
      return false;
    }
  }
}

export default SessionModel;
