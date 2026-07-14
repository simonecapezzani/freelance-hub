import { Task, type ITaskDocument } from '../models/task.model.ts';
import type { TaskStatus } from '../types/index.ts';
import {
  validateCreateTaskPayload,
  validateTaskStatusQuery,
  validateUpdateTaskPayload,
  type ValidatedUpdateTaskPayload,
} from '../utils/validation/task.validator.ts';
import {
  assertProjectOnClient,
  findOwnedClient,
} from './client.service.ts';
import { createHttpError } from '../utils/http.utils.ts';

/**
 * Returns a task owned by a user or throws a 404 error.
 * @param taskId - Task id
 * @param userId - Authenticated user id
 * @returns Owned task document
 */
async function findOwnedTask(
  taskId: string,
  userId: string,
): Promise<ITaskDocument> {
  const task = await Task.findOne({ _id: taskId, userId });

  if (!task) {
    throw createHttpError('Task not found', 404);
  }

  return task;
}

/**
 * Applies a validated task patch to a document.
 * @param task - Task document
 * @param patch - Validated update payload
 */
function applyTaskPatch(
  task: ITaskDocument,
  patch: ValidatedUpdateTaskPayload,
): void {
  if (patch.title !== undefined) {
    task.title = patch.title;
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'description')) {
    task.description = patch.description;
  }

  if (patch.status !== undefined) {
    task.status = patch.status;
  }

  if (patch.priority !== undefined) {
    task.priority = patch.priority;
  }

  if (patch.dueDate !== undefined) {
    task.dueDate = patch.dueDate ?? undefined;
  }

  if (patch.projectId !== undefined) {
    task.projectId =
      patch.projectId === null
        ? undefined
        : (patch.projectId as unknown as ITaskDocument['projectId']);
  }
}

/**
 * Creates a task for a client owned by a user.
 * @param userId - Authenticated user id
 * @param clientId - Client id
 * @param body - Raw request body
 * @returns Created task document
 */
export async function createTask(
  userId: string,
  clientId: string,
  body: unknown,
): Promise<ITaskDocument> {
  const client = await findOwnedClient(clientId, userId);
  const payload = validateCreateTaskPayload(body);

  if (payload.projectId) {
    assertProjectOnClient(client, payload.projectId);
  }

  return Task.create({
    userId,
    clientId,
    ...payload,
  });
}

/**
 * Lists tasks for a client owned by a user.
 * @param userId - Authenticated user id
 * @param clientId - Client id
 * @param status - Optional raw status filter
 * @returns Matching task documents
 */
export async function listTasks(
  userId: string,
  clientId: string,
  status?: unknown,
): Promise<ITaskDocument[]> {
  await findOwnedClient(clientId, userId);
  const validatedStatus = validateTaskStatusQuery(status);
  const filter: { clientId: string; userId: string; status?: TaskStatus } = {
    clientId,
    userId,
  };

  if (validatedStatus) {
    filter.status = validatedStatus;
  }

  return Task.find(filter).sort({ createdAt: -1 });
}

/**
 * Gets a task owned by a user.
 * @param userId - Authenticated user id
 * @param taskId - Task id
 * @returns Owned task document
 */
export async function getTask(
  userId: string,
  taskId: string,
): Promise<ITaskDocument> {
  return findOwnedTask(taskId, userId);
}

/**
 * Updates a task owned by a user.
 * @param userId - Authenticated user id
 * @param taskId - Task id
 * @param body - Raw request body
 * @returns Updated task document
 */
export async function updateTask(
  userId: string,
  taskId: string,
  body: unknown,
): Promise<ITaskDocument> {
  const task = await findOwnedTask(taskId, userId);
  const patch = validateUpdateTaskPayload(body);

  if (typeof patch.projectId === 'string') {
    const client = await findOwnedClient(task.clientId.toString(), userId);
    assertProjectOnClient(client, patch.projectId);
  }

  applyTaskPatch(task, patch);
  await task.save();
  return task;
}

/**
 * Deletes a task owned by a user.
 * @param userId - Authenticated user id
 * @param taskId - Task id
 */
export async function deleteTask(
  userId: string,
  taskId: string,
): Promise<void> {
  const task = await findOwnedTask(taskId, userId);
  await task.deleteOne();
}
