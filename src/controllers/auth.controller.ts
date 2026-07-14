import type { NextFunction, Request, Response } from 'express';
import { toAuthResponse } from '../mappers/auth.mapper.ts';
import * as authService from '../services/auth.service.ts';

/**
 * Registers a new user and returns a JWT access token.
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(toAuthResponse(user));
  } catch (error) {
    next(error);
  }
}

/**
 * Authenticates a user with email and password and returns a JWT access token.
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authService.login(req.body);
    res.json(toAuthResponse(user));
  } catch (error) {
    next(error);
  }
}
