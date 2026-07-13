import mongoose, { Schema, type Document, type Model } from 'mongoose';

/**
 * User document fields stored in MongoDB.
 */
export interface IUser {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>(
  'User',
  userSchema,
);
