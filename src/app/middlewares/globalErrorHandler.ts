import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import { AppError } from "../errors/AppError.js";

interface ValidationErrorItem {
  message?: string;
}

interface MongooseValidationError extends Error {
  errors?: Record<string, ValidationErrorItem>;
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
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  response.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && {
      stack: error.stack,
    }),
  });
};