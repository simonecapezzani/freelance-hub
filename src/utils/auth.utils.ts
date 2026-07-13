import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { getEnvConfig } from '../config/env.ts';
import type { IUserDocument } from '../models/user.model.ts';
import type { AuthResponse, JwtPayload, UserPublic } from '../types/index.ts';

const SALT_ROUNDS = 10;

/**
 * Maps a user document to the public API shape.
 * @param user - Mongoose user document
 * @returns Public user fields safe to expose to clients
 */
export function toUserPublic(user: IUserDocument): UserPublic {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

/**
 * Hashes a plain-text password for storage.
 * @param password - Plain-text password
 * @returns Bcrypt hash
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain-text password with a stored bcrypt hash.
 * @param password - Plain-text password
 * @param hash - Stored password hash
 * @returns Whether the password matches
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Signs a JWT access token for the given user id.
 * @param userId - User id to encode in the token payload
 * @returns Signed JWT string
 */
export function signAccessToken(userId: string): string {
  const { jwtSecret, jwtExpiresIn } = getEnvConfig();
  const payload: JwtPayload = { userId };
  const options: SignOptions = { expiresIn: jwtExpiresIn as SignOptions['expiresIn'] };

  return jwt.sign(payload, jwtSecret, options);
}

/**
 * Builds the auth response returned by register and login.
 * @param user - Authenticated user document
 * @returns Token and public user profile
 */
export function buildAuthResponse(user: IUserDocument): AuthResponse {
  return {
    token: signAccessToken(user._id.toString()),
    user: toUserPublic(user),
  };
}
