import jwt, {
  type JwtPayload,
} from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "../modules/user/user.interface.js";

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface VerifiedAccessToken
  extends JwtPayload,
    AccessTokenPayload {}

export const createAccessToken = (
  payload: AccessTokenPayload,
): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

export const verifyAccessToken = (
  token: string,
): VerifiedAccessToken => {
  const decodedToken = jwt.verify(
    token,
    env.jwtSecret,
  );

  if (
    typeof decodedToken === "string" ||
    !decodedToken.userId ||
    !decodedToken.email ||
    !decodedToken.role
  ) {
    throw new Error("Invalid access token");
  }

  return decodedToken as VerifiedAccessToken;
};