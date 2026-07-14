import type { Request } from 'express';
import type { ApiError } from '../middleware/error.middleware.ts';
import type { AuthRequest } from '../types/index.ts';

/**
 * Creates an HTTP error with a status code for the global error handler.
 * @param message - Error message returned to the client
 * @param statusCode - HTTP status code
 * @returns Error object with statusCode
 */
export function createHttpError(message: string, statusCode: number): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  return error;
}

/**
 * Returns true when the value is a non-empty string.
 * @param value - Value to validate
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Reads the authenticated user id from the request.
 * @param req - Express request after auth middleware
 * @returns Authenticated user id
 */
export function getUserId(req: Request): string {
  return (req as AuthRequest).userId;
}

/**
 * Reads a route id param as a string.
 * @param id - Express route param
 * @returns Route id string
 */
export function getRouteId(id: string | string[]): string {
  return Array.isArray(id) ? id[0] : id;
}

/**
 * Extracts the JWT from a standard Authorization header (`Bearer <token>`).
 * Scheme comparison is case-insensitive per RFC 6750.
 * @param authorization - Raw Authorization header value
 * @returns Token string, or null if missing or malformed
 */
export function extractBearerToken(authorization: string | undefined): string | null {
  if (!authorization) {
    return null;
  }

  const spaceIndex = authorization.indexOf(' ');

  if (spaceIndex === -1) {
    return null;
  }

  const scheme = authorization.slice(0, spaceIndex);
  const token = authorization.slice(spaceIndex + 1).trim();

  if (scheme.toLowerCase() !== 'bearer' || token.length === 0) {
    return null;
  }

  return token;
}
