import type { SignOptions } from "jsonwebtoken";

interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  clientUrls: string[];
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: SignOptions["expiresIn"];
  bcryptSaltRounds: number;
  dnsServers: string[];
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

const clientUrls = getRequiredEnvironmentVariable("CLIENT_URL")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

if (clientUrls.length === 0) {
  throw new Error("CLIENT_URL must contain at least one URL");
}

for (const clientUrl of clientUrls) {
  try {
    const parsedUrl = new URL(clientUrl);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error("CLIENT_URL must contain valid comma-separated HTTP(S) URLs");
  }
}

export const env: EnvironmentConfig = {
  nodeEnv: process.env.NODE_ENV ?? "development",

  port,

  clientUrls,

  databaseUrl:
    getRequiredEnvironmentVariable("DATABASE_URL"),

  jwtSecret,

  jwtExpiresIn: (
    process.env.JWT_EXPIRES_IN ?? "7d"
  ) as SignOptions["expiresIn"],

  bcryptSaltRounds,

  dnsServers: (process.env.DNS_SERVERS ?? "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean),
};
