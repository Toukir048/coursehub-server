import type {
  NextFunction,
  Request,
  Response,
} from "express";
import { AppError } from "../errors/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader) {
    throw new AppError(
      401,
      "Authentication token is required",
    );
  }

  const [tokenType, token] =
    authorizationHeader.split(" ");

  if (tokenType !== "Bearer" || !token) {
    throw new AppError(
      401,
      "Authorization header must use Bearer token",
    );
  }

  try {
    const decodedToken = verifyAccessToken(token);

    request.user = {
      userId: decodedToken.userId,
      email: decodedToken.email,
      role: decodedToken.role,
    };

    next();
  } catch {
    throw new AppError(
      401,
      "Invalid or expired access token",
    );
  }
};