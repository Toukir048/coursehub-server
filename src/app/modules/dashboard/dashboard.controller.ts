import type {
  Request,
  Response,
} from "express";
import { AppError } from "../../errors/AppError.js";
import { dashboardServices } from "./dashboard.service.js";

const getDashboardStatistics = async (
  request: Request,
  response: Response,
): Promise<void> => {
  if (!request.user) {
    throw new AppError(
      401,
      "Authentication information is missing",
    );
  }

  const result =
    await dashboardServices.getDashboardStatistics(
      request.user,
    );

  response.status(200).json({
    success: true,
    message:
      "Dashboard statistics retrieved successfully",
    data: result,
  });
};

export const dashboardControllers = {
  getDashboardStatistics,
};