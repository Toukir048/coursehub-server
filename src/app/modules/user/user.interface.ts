import type { Model } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser {
  name: string;
  email: string;
  password: string;
  image: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(
    candidatePassword: string,
  ): Promise<boolean>;
}

export type UserModel = Model<
  IUser,
  Record<string, never>,
  IUserMethods
>;

export interface PublicUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}