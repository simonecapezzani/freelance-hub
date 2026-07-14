import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from '../../types/index.ts';
import { createHttpError } from '../http.utils.ts';
import {
  assertObject,
  hasField,
  isValidEnumValue,
  optionalEnumValue,
  optionalTrimmedString,
  parseNullableDate,
  parseNullableObjectId,
  parseOptionalDate,
  requireNonEmptyString,
} from './validation.utils.ts';

/**
 * Normalized create task request payload.
 */
export interface ValidatedCreateTaskPayload {
  title: string;
  description?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
}

/**
 * Normalized partial update payload for a task.
 */
export interface ValidatedUpdateTaskPayload {
  title?: string;
  description?: string;
  projectId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

/**
 * Validates and normalizes a create task request body.
 * @param body - Raw request body
 * @returns Normalized create task payload
 */
export function validateCreateTaskPayload(body: unknown): ValidatedCreateTaskPayload {
  const input = assertObject(body);

  const payload: ValidatedCreateTaskPayload = {
    title: requireNonEmptyString(input.title, 'Title'),
    description: optionalTrimmedString(input.description),
    status: optionalEnumValue(input.status, TASK_STATUSES, 'status'),
    priority: optionalEnumValue(input.priority, TASK_PRIORITIES, 'priority'),
  };

  const projectId = optionalTrimmedString(input.projectId);

  if (projectId) {
    payload.projectId = projectId;
  }

  if (hasField(input, 'dueDate')) {
    payload.dueDate = parseOptionalDate(input.dueDate);
  }

  return payload;
}

/**
 * Validates and normalizes a partial update task request body.
 * @param body - Raw request body
 * @returns Normalized task patch
 */
export function validateUpdateTaskPayload(body: unknown): ValidatedUpdateTaskPayload {
  const input = assertObject(body);
  const patch: ValidatedUpdateTaskPayload = {};

  if (hasField(input, 'title')) {
    const title = input.title;

    if (typeof title !== 'string' || title.trim().length === 0) {
      throw createHttpError('Title cannot be empty', 400);
    }

    patch.title = title.trim();
  }

  if (hasField(input, 'description')) {
    patch.description = optionalTrimmedString(input.description);
  }

  if (hasField(input, 'status')) {
    patch.status = optionalEnumValue(input.status, TASK_STATUSES, 'status');
  }

  if (hasField(input, 'priority')) {
    patch.priority = optionalEnumValue(input.priority, TASK_PRIORITIES, 'priority');
  }

  if (hasField(input, 'dueDate')) {
    patch.dueDate = parseNullableDate(input.dueDate);
  }

  if (hasField(input, 'projectId')) {
    patch.projectId = parseNullableObjectId(input.projectId);
  }

  return patch;
}

/**
 * Validates an optional task status query parameter.
 * @param status - Raw query value
 * @returns Valid task status or undefined
 */
export function validateTaskStatusQuery(status: unknown): TaskStatus | undefined {
  if (status === undefined) {
    return undefined;
  }

  if (!isValidEnumValue(status, TASK_STATUSES)) {
    throw createHttpError('Invalid status filter', 400);
  }

  return status;
}
