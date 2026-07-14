import type { ITaskDocument } from '../models/task.model.ts';

/**
 * Maps a task document to its public API representation.
 * @param task - Mongoose task document
 * @returns Serialized task
 */
export function toTaskResponse(task: ITaskDocument) {
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
