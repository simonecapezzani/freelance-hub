import type { NextFunction, Request, Response } from 'express';
import { toTaskResponse } from '../mappers/task.mapper.ts';
import * as taskService from '../services/task.service.ts';
import { getRouteId, getUserId } from '../utils/http.utils.ts';

/**
 * Creates a task for a client owned by the authenticated user.
 */
export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const task = await taskService.createTask(
      getUserId(req),
      getRouteId(req.params.id),
      req.body,
    );
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
    const tasks = await taskService.listTasks(
      getUserId(req),
      getRouteId(req.params.id),
      req.query.status,
    );
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
    const task = await taskService.getTask(
      getUserId(req),
      getRouteId(req.params.id),
    );
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
    const task = await taskService.updateTask(
      getUserId(req),
      getRouteId(req.params.id),
      req.body,
    );
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
    await taskService.deleteTask(getUserId(req), getRouteId(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
