import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from '../types/index.ts';

/**
 * Task document fields stored in MongoDB.
 */
export interface ITask {
  userId: Types.ObjectId;
  clientId: Types.ObjectId;
  projectId?: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
}

export interface ITaskDocument extends ITask, Document {}

const taskSchema = new Schema<ITaskDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'todo',
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

taskSchema.index({ clientId: 1, status: 1 });

export const Task: Model<ITaskDocument> = mongoose.model<ITaskDocument>(
  'Task',
  taskSchema,
);
