import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getEnvConfig } from '../config/env.ts';
import type { AuthRequest, JwtPayload } from '../types/index.ts';
import { extractBearerToken } from '../utils/http.utils.ts';

/**
 * Verifies the Bearer JWT and attaches the authenticated user id to the request.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const { jwtSecret } = getEnvConfig();
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;
    (req as AuthRequest).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
