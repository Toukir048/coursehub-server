import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: "CourseHub API is running",
  });
});

app.get("/api/v1/health", (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: "CourseHub server is healthy",
    environment: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  });
});

app.use(
  (
    request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    response.status(404).json({
      success: false,
      message: `Route not found: ${request.method} ${request.originalUrl}`,
    });
  },
);

app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    console.error(error);

    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  },
);

export default app;