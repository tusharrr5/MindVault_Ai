import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

// Extend Express Request interface to hold the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
      };
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({
      error: true,
      code: 'UNAUTHORIZED',
      message: 'Missing or invalid Authorization header',
    });
  }

  const token = authHeader.substring(7).trim();

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    next();
  } catch (error: any) {
    console.error('--- EXACT FIREBASE AUTH ERROR ---');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Token first 10 chars:', token.substring(0, 10));
    console.error('---------------------------------');
    return res.status(401).json({
      error: true,
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  }
};
