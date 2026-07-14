import type { IUserDocument } from '../models/user.model.ts';
import { buildAuthResponse } from '../utils/auth.utils.ts';

/**
 * Maps an authenticated user document to the public auth response.
 * @param user - Authenticated user document
 * @returns JWT and public user data
 */
export function toAuthResponse(user: IUserDocument) {
  return buildAuthResponse(user);
}
