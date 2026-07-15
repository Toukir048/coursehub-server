import { Router } from "express";
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

export const authRouter = router;