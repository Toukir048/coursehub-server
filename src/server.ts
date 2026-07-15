import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT) || 5000;

const server = app.listen(port, () => {
  console.log(`CourseHub server is running on port ${port}`);
});

const shutdownServer = (signal: string) => {
  console.log(`${signal} received. Shutting down server...`);

  server.close(() => {
    console.log("CourseHub server stopped successfully.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => {
  shutdownServer("SIGTERM");
});

process.on("SIGINT", () => {
  shutdownServer("SIGINT");
});