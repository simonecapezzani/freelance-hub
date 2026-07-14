import { createHttpError } from '../http.utils.ts';

/**
 * Ensures the value is a plain object suitable for payload parsing.
 * @param value - Value to check
 * @param label - Label used in error messages
 * @returns Plain object record
 */
export function assertObject(value: unknown, label = 'body'): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw createHttpError(`Invalid ${label}`, 400);
  }

  return value as Record<string, unknown>;
}

/**
 * Returns true when the object explicitly contains the given key.
 * @param body - Parsed request body
 * @param key - Field name to check
 */
export function hasField(body: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(body, key);
}

/**
 * Returns true when the value is a member of the allowed enum list.
 * @param value - Value to validate
 * @param allowed - Allowed enum values
 */
export function isValidEnumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

/**
 * Validates a required non-empty string and returns the trimmed value.
 * @param value - Raw field value
 * @param fieldName - Field name used in error messages
 * @returns Trimmed string
 */
export function requireNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createHttpError(`${fieldName} is required`, 400);
  }

  return value.trim();
}

/**
 * Returns a trimmed string or undefined when the value is missing or empty.
 * @param value - Raw field value
 */
export function optionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Returns a normalized email string or undefined when empty.
 * @param value - Raw email value
 */
export function optionalEmail(value: unknown): string | undefined {
  const trimmed = optionalTrimmedString(value);
  return trimmed?.toLowerCase();
}

/**
 * Parses an optional ISO date string into a Date instance.
 * @param value - Raw date value
 * @param fieldName - Field name used in error messages
 */
export function parseOptionalDate(value: unknown, fieldName = 'dueDate'): Date | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw createHttpError(`Invalid ${fieldName}`, 400);
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw createHttpError(`Invalid ${fieldName}`, 400);
  }

  return parsed;
}

/**
 * Parses a nullable date field for PATCH requests.
 * @param value - Raw date value
 * @param fieldName - Field name used in error messages
 * @returns Parsed date or null when the field should be cleared
 */
export function parseNullableDate(value: unknown, fieldName = 'dueDate'): Date | null {
  if (value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw createHttpError(`Invalid ${fieldName}`, 400);
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw createHttpError(`Invalid ${fieldName}`, 400);
  }

  return parsed;
}

/**
 * Parses a nullable ObjectId string for PATCH requests.
 * @param value - Raw id value
 * @param fieldName - Field name used in error messages
 * @returns Id string or null when the field should be cleared
 */
export function parseNullableObjectId(
  value: unknown,
  fieldName = 'projectId',
): string | null {
  if (value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createHttpError(`Invalid ${fieldName}`, 400);
  }

  return value.trim();
}

/**
 * Validates an optional enum value when the field is present.
 * @param value - Raw enum value
 * @param allowed - Allowed enum values
 * @param fieldName - Field name used in error messages
 */
export function optionalEnumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fieldName: string,
): T | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isValidEnumValue(value, allowed)) {
    throw createHttpError(`Invalid ${fieldName}`, 400);
  }

  return value;
}

/**
 * Validates a required enum value.
 * @param value - Raw enum value
 * @param allowed - Allowed enum values
 * @param fieldName - Field name used in error messages
 */
export function requireEnumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fieldName: string,
): T {
  if (!isValidEnumValue(value, allowed)) {
    throw createHttpError(`Invalid ${fieldName}`, 400);
  }

  return value;
}
