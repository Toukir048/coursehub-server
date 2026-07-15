import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { reviewControllers } from "./review.controller.js";

const router = Router();

router.get(
  "/mine",
  authenticate,
  asyncHandler(
    reviewControllers.getMyReviews,
  ),
);

router.get(
  "/course/:courseId",
  asyncHandler(
    reviewControllers.getCourseReviews,
  ),
);

router.post(
  "/",
  authenticate,
  asyncHandler(
    reviewControllers.createReview,
  ),
);

router.delete(
  "/:reviewId",
  authenticate,
  asyncHandler(
    reviewControllers.deleteReview,
  ),
);

export const reviewRouter = router;