import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import { PROJECT_STATUSES, type ProjectStatus, type TeamMember } from '../types/index.ts';

/**
 * Project embedded in a client document.
 */
export interface IProject {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  status: ProjectStatus;
  createdAt: Date;
}

/**
 * Client document fields stored in MongoDB.
 */
export interface IClient {
  userId: Types.ObjectId;
  name: string;
  email?: string;
  company?: string;
  notes?: string;
  teamMembers: TeamMember[];
  projects: IProject[];
  createdAt: Date;
}

export interface IClientDocument extends IClient, Document {}

const teamMemberSchema = new Schema<TeamMember>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    notes: { type: String, trim: true },
  },
  { _id: false },
);

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const clientSchema = new Schema<IClientDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    company: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    teamMembers: {
      type: [teamMemberSchema],
      default: [],
    },
    projects: {
      type: [projectSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const Client: Model<IClientDocument> = mongoose.model<IClientDocument>(
  'Client',
  clientSchema,
);
