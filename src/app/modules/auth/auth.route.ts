import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorizeRoles } from "../../middlewares/authorize.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authControllers } from "./auth.controller.js";

const router = Router();

router.post(
  "/register",
  asyncHandler(authControllers.registerUser),
);

router.post(
  "/login",
  asyncHandler(authControllers.loginUser),
);

router.get(
  "/me",
  authenticate,
  asyncHandler(authControllers.getCurrentUser),
);

router.get(
  "/admin-check",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(authControllers.checkAdminAccess),
);

export const authRouter = router;