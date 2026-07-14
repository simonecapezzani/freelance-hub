import { User, type IUserDocument } from '../models/user.model.ts';
import { createHttpError } from '../utils/http.utils.ts';
import {
  comparePassword,
  hashPassword,
} from '../utils/auth.utils.ts';
import {
  validateLoginPayload,
  validateRegisterPayload,
} from '../utils/validation/auth.validator.ts';

/**
 * Registers a user after validating and hashing the password.
 * @param body - Raw register request body
 * @returns Created user document
 */
export async function register(body: unknown): Promise<IUserDocument> {
  const { email, password, name } = validateRegisterPayload(body);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError('Email already in use', 400);
  }

  try {
    const hashedPassword = await hashPassword(password);
    return await User.create({
      email,
      password: hashedPassword,
      name,
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      throw createHttpError('Email already in use', 400);
    }

    throw error;
  }
}

/**
 * Authenticates a user with email and password.
 * @param body - Raw login request body
 * @returns Authenticated user document
 */
export async function login(body: unknown): Promise<IUserDocument> {
  const { email, password } = validateLoginPayload(body);
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError('Invalid credentials', 401);
  }

  const passwordMatches = await comparePassword(password, user.password);

  if (!passwordMatches) {
    throw createHttpError('Invalid credentials', 401);
  }

  return user;
}
