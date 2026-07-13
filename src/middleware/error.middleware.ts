import type { NextFunction, Request, Response } from 'express';

/**
 * Application error with an optional HTTP status code.
 */
export interface ApiError extends Error {
  statusCode?: number;
}

/**
 * Handles requests that do not match any registered route.
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Not found' });
}

/**
 * Global error handler for unhandled exceptions in route handlers.
 */
export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({ message });
}
