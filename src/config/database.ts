import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the provided URI.
 * @param uri - MongoDB connection string
 */
export async function connectDatabase(uri: string): Promise<void> {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log('MongoDB connected');
}
