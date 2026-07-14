import type { NextFunction, Request, Response } from 'express';
import { Client, type IClientDocument } from '../models/client.model.ts';
import { Task, type ITaskDocument } from '../models/task.model.ts';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from '../types/index.ts';
import {
  createHttpError,
  getRouteId,
  getUserId,
  isNonEmptyString,
} from '../utils/http.utils.ts';

interface CreateTaskBody {
  title?: string;
  description?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

interface UpdateTaskBody {
  title?: string;
  description?: string;
  projectId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

/**
 * Returns true when the value is a member of the allowed enum list.
 * @param value - Value to validate
 * @param allowed - Allowed enum values
 */
function isValidEnumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

/**
 * Maps a task document to the API response shape.
 * @param task - Mongoose task document
 * @returns Serialized task
 */
function toTaskResponse(task: ITaskDocument) {
  return {
    id: task._id.toString(),
    userId: task.userId.toString(),
    clientId: task.clientId.toString(),
    projectId: task.projectId?.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
  };
}

/**
 * Returns a client owned by the authenticated user or throws 404.
 * @param clientId - Client id from route params
 * @param userId - Authenticated user id
 * @returns Client document
 */
async function findOwnedClient(
  clientId: string,
  userId: string,
): Promise<IClientDocument> {
  const client = await Client.findOne({ _id: clientId, userId });

  if (!client) {
    throw createHttpError('Client not found', 404);
  }

  return client;
}

/**
 * Verifies that a project id exists on the given client.
 * @param client - Client document
 * @param projectId - Project id to validate
 */
function validateProjectId(client: IClientDocument, projectId: string): void {
  const projectExists = client.projects.some(
    (project) => project._id?.toString() === projectId,
  );

  if (!projectExists) {
    throw createHttpError('Project not found on client', 400);
  }
}

/**
 * Returns a task owned by the authenticated user or throws 404.
 * @param taskId - Task id from route params
 * @param userId - Authenticated user id
 * @returns Task document
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
 * Creates a task for a client owned by the authenticated user.
 */
export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const clientId = getRouteId(req.params.id);
    const userId = getUserId(req);
    const client = await findOwnedClient(clientId, userId);

    const { title, description, projectId, status, priority, dueDate } =
      req.body as CreateTaskBody;

    if (!isNonEmptyString(title)) {
      throw createHttpError('Title is required', 400);
    }

    if (status !== undefined && !isValidEnumValue(status, TASK_STATUSES)) {
      throw createHttpError('Invalid status', 400);
    }

    if (priority !== undefined && !isValidEnumValue(priority, TASK_PRIORITIES)) {
      throw createHttpError('Invalid priority', 400);
    }

    if (isNonEmptyString(projectId)) {
      validateProjectId(client, projectId);
    }

    const task = await Task.create({
      userId,
      clientId,
      title: title.trim(),
      description: isNonEmptyString(description) ? description.trim() : undefined,
      projectId: isNonEmptyString(projectId) ? projectId : undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    res.status(201).json(toTaskResponse(task));
  } catch (error) {
    next(error);
  }
}

/**
 * Lists tasks for a client owned by the authenticated user.
 */
export async function listTasks(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const clientId = getRouteId(req.params.id);
    const userId = getUserId(req);
    await findOwnedClient(clientId, userId);

    const { status } = req.query;

    if (status !== undefined && !isValidEnumValue(status, TASK_STATUSES)) {
      throw createHttpError('Invalid status filter', 400);
    }

    const filter: { clientId: string; userId: string; status?: TaskStatus } = {
      clientId,
      userId,
    };

    if (typeof status === 'string') {
      filter.status = status;
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks.map(toTaskResponse));
  } catch (error) {
    next(error);
  }
}

/**
 * Returns a single task owned by the authenticated user.
 */
export async function getTask(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const task = await findOwnedTask(getRouteId(req.params.id), getUserId(req));
    res.json(toTaskResponse(task));
  } catch (error) {
    next(error);
  }
}

/**
 * Partially updates a task owned by the authenticated user.
 */
export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const taskId = getRouteId(req.params.id);
    const userId = getUserId(req);
    const { title, description, projectId, status, priority, dueDate } =
      req.body as UpdateTaskBody;

    const task = await findOwnedTask(taskId, userId);

    if (title !== undefined) {
      if (!isNonEmptyString(title)) {
        throw createHttpError('Title cannot be empty', 400);
      }

      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = isNonEmptyString(description) ? description.trim() : undefined;
    }

    if (status !== undefined) {
      if (!isValidEnumValue(status, TASK_STATUSES)) {
        throw createHttpError('Invalid status', 400);
      }

      task.status = status;
    }

    if (priority !== undefined) {
      if (!isValidEnumValue(priority, TASK_PRIORITIES)) {
        throw createHttpError('Invalid priority', 400);
      }

      task.priority = priority;
    }

    if (dueDate !== undefined) {
      if (dueDate === null) {
        task.dueDate = undefined;
      } else {
        const parsedDueDate = new Date(dueDate);

        if (Number.isNaN(parsedDueDate.getTime())) {
          throw createHttpError('Invalid dueDate', 400);
        }

        task.dueDate = parsedDueDate;
      }
    }

    if (projectId !== undefined) {
      if (projectId === null || projectId === '') {
        task.projectId = undefined;
      } else if (isNonEmptyString(projectId)) {
        const client = await findOwnedClient(task.clientId.toString(), userId);
        validateProjectId(client, projectId);
        task.projectId = projectId as unknown as ITaskDocument['projectId'];
      } else {
        throw createHttpError('Invalid projectId', 400);
      }
    }

    await task.save();
    res.json(toTaskResponse(task));
  } catch (error) {
    next(error);
  }
}

/**
 * Deletes a task owned by the authenticated user.
 */
export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const task = await findOwnedTask(getRouteId(req.params.id), getUserId(req));
    await task.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
