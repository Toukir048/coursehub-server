import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { AppError } from "../../errors/AppError.js";
import { User } from "../user/user.model.js";
import { createPublicUser } from "../user/user.utils.js";
import type {
  LoginUserPayload,
  RegisterUserPayload,
} from "./auth.interface.js";
import { authServices } from "./auth.service.js";

const registerUser = async (
  request: Request<
    ParamsDictionary,
    unknown,
    RegisterUserPayload
  >,
  response: Response,
): Promise<void> => {
  const result = await authServices.registerUser(
    request.body,
  );

  response.status(201).json({
    success: true,
    message: "Account created successfully",
    data: result,
  });
};

const loginUser = async (
  request: Request<
    ParamsDictionary,
    unknown,
    LoginUserPayload
  >,
  response: Response,
): Promise<void> => {
  const result = await authServices.loginUser(
    request.body,
  );

  response.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
};

const getCurrentUser = async (
  request: Request,
  response: Response,
): Promise<void> => {
  if (!request.user) {
    throw new AppError(
      401,
      "Authentication information is missing",
    );
  }

  const user = await User.findById(request.user.userId);

  if (!user) {
    throw new AppError(404, "User account not found");
  }

  response.status(200).json({
    success: true,
    message: "Current user retrieved successfully",
    data: {
      user: createPublicUser(user),
    },
  });
};

const checkAdminAccess = async (
  request: Request,
  response: Response,
): Promise<void> => {
  response.status(200).json({
    success: true,
    message: "Admin access verified successfully",
    data: {
      user: request.user,
    },
  });
};

export const authControllers = {
  registerUser,
  loginUser,
  getCurrentUser,
  checkAdminAccess,
};