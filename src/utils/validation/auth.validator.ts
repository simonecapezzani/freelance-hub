import {
  assertObject,
  optionalEmail,
  requireNonEmptyString,
} from './validation.utils.ts';

/**
 * Normalized register request payload.
 */
export interface ValidatedRegisterPayload {
  email: string;
  password: string;
  name: string;
}

/**
 * Normalized login request payload.
 */
export interface ValidatedLoginPayload {
  email: string;
  password: string;
}

/**
 * Validates and normalizes a register request body.
 * @param body - Raw request body
 * @returns Normalized register payload
 */
export function validateRegisterPayload(body: unknown): ValidatedRegisterPayload {
  const input = assertObject(body);

  return {
    email: requireNonEmptyString(input.email, 'Email').toLowerCase(),
    password: requireNonEmptyString(input.password, 'Password'),
    name: requireNonEmptyString(input.name, 'Name'),
  };
}

/**
 * Validates and normalizes a login request body.
 * @param body - Raw request body
 * @returns Normalized login payload
 */
export function validateLoginPayload(body: unknown): ValidatedLoginPayload {
  const input = assertObject(body);

  return {
    email: requireNonEmptyString(input.email, 'Email').toLowerCase(),
    password: requireNonEmptyString(input.password, 'Password'),
  };
}
