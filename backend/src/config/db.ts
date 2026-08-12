import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/certichain';
  try {
    await mongoose.connect(mongoURI);
    console.log(`[MongoDB] Connected to database: ${mongoURI}`);
  } catch (error) {
    console.warn(`[MongoDB] Connection notice (running in standalone indexer mode if offline):`, error);
  }
};
