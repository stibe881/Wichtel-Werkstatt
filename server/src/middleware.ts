import { Request, Response, NextFunction } from 'express';
import pool from './db';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        isAdmin: boolean;
      };
    }
  }
}

/**
 * Authentication middleware - verifies user token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Keine Authentifizierung vorhanden' });
    }

    // Find user by token
    const [rows]: any[] = await pool.query(
      'SELECT id, email, is_admin FROM users WHERE token = ?',
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Ungültiger Token' });
    }

    // Attach user to request
    req.user = {
      id: rows[0].id,
      email: rows[0].email,
      isAdmin: rows[0].is_admin === 1 || rows[0].is_admin === true
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentifizierung fehlgeschlagen' });
  }
};

/**
 * Admin-only middleware - must be used after authenticate
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Keine Authentifizierung vorhanden' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin-Berechtigung erforderlich' });
  }

  next();
};
