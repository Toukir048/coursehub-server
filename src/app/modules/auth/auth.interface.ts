import type { PublicUser } from "../user/user.interface.js";

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  image?: string;
}

export interface LoginUserPayload {
  email: string;
  password: string;
}

export interface AuthenticationResult {
  user: PublicUser;
  accessToken: string;
}