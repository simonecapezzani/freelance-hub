import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getEnvConfig } from '../config/env.ts';
import type { AuthRequest, JwtPayload } from '../types/index.ts';

/**
 * Verifies the Bearer JWT and attaches the authenticated user id to the request.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const { jwtSecret } = getEnvConfig();
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;
    (req as AuthRequest).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
