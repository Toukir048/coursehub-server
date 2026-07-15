import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { AppError } from "../errors/AppError.js";
import type { UserRole } from "../modules/user/user.interface.js";

export const authorizeRoles = (
  ...allowedRoles: UserRole[]
): RequestHandler => {
  return (
    request: Request,
    _response: Response,
    next: NextFunction,
  ): void => {
    if (!request.user) {
      throw new AppError(
        401,
        "You must be logged in to access this resource",
      );
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new AppError(
        403,
        "You do not have permission to access this resource",
      );
    }

    next();
  };
};