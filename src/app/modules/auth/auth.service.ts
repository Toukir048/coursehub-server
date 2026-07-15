import { AppError } from "../../errors/AppError.js";
import { createAccessToken } from "../../utils/jwt.js";
import { User } from "../user/user.model.js";
import { createPublicUser } from "../user/user.utils.js";
import type {
  AuthenticationResult,
  LoginUserPayload,
  RegisterUserPayload,
} from "./auth.interface.js";

const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

const validateRegisterPayload = (
  payload: RegisterUserPayload,
): void => {
  const name = payload.name?.trim();
  const email = payload.email?.trim();
  const password = payload.password;

  if (!name || name.length < 2) {
    throw new AppError(
      400,
      "Name must contain at least 2 characters",
    );
  }

  if (!email) {
    throw new AppError(400, "Email address is required");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new AppError(
      400,
      "Please provide a valid email address",
    );
  }

  if (!password || password.length < 6) {
    throw new AppError(
      400,
      "Password must contain at least 6 characters",
    );
  }
};

const validateLoginPayload = (
  payload: LoginUserPayload,
): void => {
  if (!payload.email?.trim() || !payload.password) {
    throw new AppError(
      400,
      "Email and password are required",
    );
  }
};

const registerUser = async (
  payload: RegisterUserPayload,
): Promise<AuthenticationResult> => {
  validateRegisterPayload(payload);

  const normalizedEmail = normalizeEmail(payload.email);

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new AppError(
      409,
      "An account already exists with this email",
    );
  }

  const user = await User.create({
    name: payload.name.trim(),
    email: normalizedEmail,
    password: payload.password,
    image: payload.image?.trim() ?? "",
    role: "user",
  });

  const accessToken = createAccessToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    user: createPublicUser(user),
    accessToken,
  };
};

const loginUser = async (
  payload: LoginUserPayload,
): Promise<AuthenticationResult> => {
  validateLoginPayload(payload);

  const normalizedEmail = normalizeEmail(payload.email);

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw new AppError(
      401,
      "Invalid email or password",
    );
  }

  const passwordMatched = await user.comparePassword(
    payload.password,
  );

  if (!passwordMatched) {
    throw new AppError(
      401,
      "Invalid email or password",
    );
  }

  const accessToken = createAccessToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    user: createPublicUser(user),
    accessToken,
  };
};

export const authServices = {
  registerUser,
  loginUser,
};