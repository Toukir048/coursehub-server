import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { dashboardControllers } from "./dashboard.controller.js";

const router = Router();

router.get(
  "/statistics",
  authenticate,
  asyncHandler(
    dashboardControllers.getDashboardStatistics,
  ),
);

export const dashboardRouter = router;