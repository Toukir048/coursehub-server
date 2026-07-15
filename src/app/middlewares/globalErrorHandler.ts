import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import { AppError } from "../errors/AppError.js";
import { env } from "../config/env.js";

interface ValidationErrorItem {
  message?: string;
}

interface MongooseValidationError extends Error {
  errors?: Record<string, ValidationErrorItem>;
}

interface MongoServerError extends Error {
  code?: number;
  keyPattern?: Record<string, number>;
}

export const globalErrorHandler: ErrorRequestHandler = (
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal server error";

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === "ValidationError") {
    const validationError =
      error as MongooseValidationError;

    const validationMessages = Object.values(
      validationError.errors ?? {},
    )
      .map((item) => item.message)
      .filter(Boolean);

    statusCode = 400;
    message =
      validationMessages.join(", ") ||
      "Invalid request data";
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  } else if ((error as MongoServerError).code === 11000) {
    statusCode = 409;
    message = (error as MongoServerError).keyPattern?.email
      ? "An account with this email already exists"
      : "A resource with these details already exists";
  } else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid access token";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Access token has expired";
  }

  if (env.nodeEnv !== "production") {
    console.error(error);
  }

  response.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv !== "production" && {
      stack: error.stack,
    }),
  });
};
