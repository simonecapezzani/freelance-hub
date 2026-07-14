import type { Project, TeamMember } from '../../types/index.ts';
import { createHttpError } from '../http.utils.ts';
import {
  assertObject,
  hasField,
  optionalEmail,
  optionalTrimmedString,
  requireNonEmptyString,
} from './validation.utils.ts';

/**
 * Normalized create client request payload.
 */
export interface ValidatedCreateClientPayload {
  name: string;
  email?: string;
  company?: string;
  notes?: string;
  teamMembers: TeamMember[];
  projects: Project[];
}

/**
 * Normalized partial update payload for a client.
 */
export interface ValidatedUpdateClientPayload {
  name?: string;
  email?: string;
  company?: string;
  notes?: string;
  teamMembers?: TeamMember[];
  projects?: Project[];
}

/**
 * Validates and normalizes a create client request body.
 * @param body - Raw request body
 * @returns Normalized create client payload
 */
export function validateCreateClientPayload(body: unknown): ValidatedCreateClientPayload {
  const input = assertObject(body);

  return {
    name: requireNonEmptyString(input.name, 'Name'),
    email: optionalEmail(input.email),
    company: optionalTrimmedString(input.company),
    notes: optionalTrimmedString(input.notes),
    teamMembers: Array.isArray(input.teamMembers) ? (input.teamMembers as TeamMember[]) : [],
    projects: Array.isArray(input.projects) ? (input.projects as Project[]) : [],
  };
}

/**
 * Validates and normalizes a partial update client request body.
 * @param body - Raw request body
 * @returns Normalized client patch
 */
export function validateUpdateClientPayload(body: unknown): ValidatedUpdateClientPayload {
  const input = assertObject(body);
  const patch: ValidatedUpdateClientPayload = {};

  if (hasField(input, 'name')) {
    const name = input.name;

    if (typeof name !== 'string' || name.trim().length === 0) {
      throw createHttpError('Name cannot be empty', 400);
    }

    patch.name = name.trim();
  }

  if (hasField(input, 'email')) {
    patch.email = optionalEmail(input.email);
  }

  if (hasField(input, 'company')) {
    patch.company = optionalTrimmedString(input.company);
  }

  if (hasField(input, 'notes')) {
    patch.notes = optionalTrimmedString(input.notes);
  }

  if (hasField(input, 'teamMembers')) {
    patch.teamMembers = Array.isArray(input.teamMembers)
      ? (input.teamMembers as TeamMember[])
      : [];
  }

  if (hasField(input, 'projects')) {
    patch.projects = Array.isArray(input.projects) ? (input.projects as Project[]) : [];
  }

  return patch;
}
