import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { env } from "./app/config/env.js";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";
import { authRouter } from "./app/modules/auth/auth.route.js";

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
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

app.get(
  "/api/v1/health",
  (_request: Request, response: Response) => {
    response.status(200).json({
      success: true,
      message: "CourseHub server is healthy",
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
    });
  },
);

app.use("/api/v1/auth", authRouter);

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

app.use(globalErrorHandler);

export default app;