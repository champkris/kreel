import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    userType: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Access denied. No token provided.' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, userType: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid token or user not active.' }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: 'Invalid token.' }
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Access denied. Please authenticate.' }
      });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. Insufficient permissions.' }
      });
    }

    next();
  };
};
