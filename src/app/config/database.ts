import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.databaseUrl);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed");

    if (error instanceof Error) {
      console.error(error.message);
    }

    throw error;
  }
};

export const disconnectDatabase =
  async (): Promise<void> => {
    await mongoose.disconnect();

    console.log("MongoDB disconnected successfully");
  };