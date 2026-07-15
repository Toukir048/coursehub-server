import type { SignOptions } from "jsonwebtoken";

interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  clientUrl: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: SignOptions["expiresIn"];
  bcryptSaltRounds: number;
}

const getRequiredEnvironmentVariable = (
  variableName: string,
): string => {
  const value = process.env[variableName];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${variableName}`,
    );
  }

  return value;
};

const parsePositiveNumber = (
  value: string | undefined,
  defaultValue: number,
  variableName: string,
): number => {
  const parsedValue = Number(value ?? defaultValue);

  if (
    Number.isNaN(parsedValue) ||
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0
  ) {
    throw new Error(
      `${variableName} must be a valid positive integer`,
    );
  }

  return parsedValue;
};

const port = parsePositiveNumber(
  process.env.PORT,
  5000,
  "PORT",
);

const bcryptSaltRounds = parsePositiveNumber(
  process.env.BCRYPT_SALT_ROUNDS,
  12,
  "BCRYPT_SALT_ROUNDS",
);

const jwtSecret =
  getRequiredEnvironmentVariable("JWT_SECRET");

if (jwtSecret.length < 32) {
  throw new Error(
    "JWT_SECRET must contain at least 32 characters",
  );
}

export const env: EnvironmentConfig = {
  nodeEnv: process.env.NODE_ENV ?? "development",

  port,

  clientUrl:
    process.env.CLIENT_URL ?? "http://localhost:5173",

  databaseUrl:
    getRequiredEnvironmentVariable("DATABASE_URL"),

  jwtSecret,

  jwtExpiresIn: (
    process.env.JWT_EXPIRES_IN ?? "7d"
  ) as SignOptions["expiresIn"],

  bcryptSaltRounds,
};