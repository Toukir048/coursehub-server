import bcrypt from "bcrypt";
import {
  model,
  Schema,
  type HydratedDocument,
} from "mongoose";
import { env } from "../../config/env.js";
import type {
  IUser,
  IUserMethods,
  UserModel,
} from "./user.interface.js";

const userSchema = new Schema<
  IUser,
  UserModel,
  IUserMethods
>(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters"],
      maxlength: [
        50,
        "Name cannot contain more than 50 characters",
      ],
    },

    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [
        6,
        "Password must contain at least 6 characters",
      ],
      select: false,
    },

    image: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "{VALUE} is not a valid user role",
      },
      default: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(
    this.password,
    env.bcryptSaltRounds,
  );
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
  },
);

export type UserDocument = HydratedDocument<
  IUser,
  IUserMethods
>;

export const User = model<IUser, UserModel>(
  "User",
  userSchema,
);