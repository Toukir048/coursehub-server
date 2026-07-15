interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  clientUrl: string;
  databaseUrl: string;
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

const port = Number(process.env.PORT ?? 5000);

if (Number.isNaN(port) || port <= 0) {
  throw new Error("PORT must be a valid positive number");
}

export const env: EnvironmentConfig = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  clientUrl:
    process.env.CLIENT_URL ?? "http://localhost:5173",
  databaseUrl:
    getRequiredEnvironmentVariable("DATABASE_URL"),
};