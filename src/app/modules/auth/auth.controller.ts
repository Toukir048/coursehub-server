import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
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

export const authControllers = {
  registerUser,
  loginUser,
};