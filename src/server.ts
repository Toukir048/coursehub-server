import "dotenv/config";
import { setServers } from "node:dns";
import app from "./app.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./app/config/database.js";
import { env } from "./app/config/env.js";

if (env.dnsServers.length > 0) {
  setServers(env.dnsServers);

  console.log(
    `Custom DNS servers enabled: ${env.dnsServers.join(", ")}`,
  );
}

let server: ReturnType<typeof app.listen> | null = null;
let isShuttingDown = false;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    server = app.listen(env.port, () => {
      console.log(
        `CourseHub server is running on port ${env.port}`,
      );
    });
  } catch (error) {
    console.error("CourseHub server failed to start");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exit(1);
  }
};

const shutdownServer = async (
  signal: string,
): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`${signal} received. Shutting down server...`);

  const finishShutdown = async (): Promise<void> => {
    try {
      await disconnectDatabase();
      console.log("CourseHub server stopped successfully");
      process.exit(0);
    } catch (error) {
      console.error("Failed to disconnect database");
      console.error(error);
      process.exit(1);
    }
  };

  if (!server) {
    await finishShutdown();
    return;
  }

  server.close((error) => {
    if (error) {
      console.error("Failed to close HTTP server");
      console.error(error);
      process.exit(1);
    }

    void finishShutdown();
  });
};

process.on("SIGINT", () => {
  void shutdownServer("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdownServer("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  void shutdownServer("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  void shutdownServer("uncaughtException");
});

void startServer();