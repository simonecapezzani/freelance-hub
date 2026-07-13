import type { NextFunction, Request, Response } from 'express';
import { User } from '../models/user.model.ts';
import type { ApiError } from '../middleware/error.middleware.ts';
import {
  buildAuthResponse,
  comparePassword,
  hashPassword,
} from '../utils/auth.utils.ts';

interface RegisterBody {
  email?: string;
  password?: string;
  name?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

/**
 * Creates an HTTP error with a status code for the global error handler.
 * @param message - Error message returned to the client
 * @param statusCode - HTTP status code
 * @returns Error object with statusCode
 */
function createHttpError(message: string, statusCode: number): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  return error;
}

/**
 * Returns true when the value is a non-empty string.
 * @param value - Value to validate
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Registers a new user and returns a JWT access token.
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password, name } = req.body as RegisterBody;

    if (!isNonEmptyString(email) || !isNonEmptyString(password) || !isNonEmptyString(name)) {
      throw createHttpError('Email, password, and name are required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      throw createHttpError('Email already in use', 400);
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: name.trim(),
    });

    res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      next(createHttpError('Email already in use', 400));
      return;
    }

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
    const { email, password } = req.body as LoginBody;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      throw createHttpError('Email and password are required', 400);
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      throw createHttpError('Invalid credentials', 401);
    }

    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
      throw createHttpError('Invalid credentials', 401);
    }

    res.json(buildAuthResponse(user));
  } catch (error) {
    next(error);
  }
}
