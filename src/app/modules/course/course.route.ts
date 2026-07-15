import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { courseControllers } from "./course.controller.js";

const router = Router();

router.get(
  "/",
  asyncHandler(courseControllers.getCourses),
);

router.get(
  "/mine",
  authenticate,
  asyncHandler(courseControllers.getMyCourses),
);

router.post(
  "/",
  authenticate,
  asyncHandler(courseControllers.createCourse),
);

router.get(
  "/:courseId",
  asyncHandler(courseControllers.getCourseById),
);

router.patch(
  "/:courseId",
  authenticate,
  asyncHandler(courseControllers.updateCourse),
);

router.delete(
  "/:courseId",
  authenticate,
  asyncHandler(courseControllers.deleteCourse),
);

export const courseRouter = router;