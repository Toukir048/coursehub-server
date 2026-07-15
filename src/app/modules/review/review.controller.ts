import type {
  Request,
  Response,
} from "express";
import { AppError } from "../../errors/AppError.js";
import type { CreateReviewPayload } from "./review.interface.js";
import { reviewServices } from "./review.service.js";

const getAuthenticatedUser = (
  request: Request,
) => {
  if (!request.user) {
    throw new AppError(
      401,
      "Authentication information is missing",
    );
  }

  return request.user;
};

const getRouteParameter = (
  request: Request,
  parameterName: string,
): string => {
  const value =
    request.params[parameterName];

  if (
    typeof value !== "string" ||
    !value
  ) {
    throw new AppError(
      400,
      `${parameterName} is required`,
    );
  }

  return value;
};

const createReview = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const result =
    await reviewServices.createReview(
      request.body as CreateReviewPayload,
      user.userId,
    );

  response.status(201).json({
    success: true,
    message: "Review added successfully",
    data: {
      review: result,
    },
  });
};

const getCourseReviews = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const courseId = getRouteParameter(
    request,
    "courseId",
  );

  const result =
    await reviewServices.getCourseReviews(
      courseId,
    );

  response.status(200).json({
    success: true,
    message:
      "Course reviews retrieved successfully",
    data: {
      reviews: result,
    },
  });
};

const getMyReviews = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const result =
    await reviewServices.getMyReviews(
      user.userId,
    );

  response.status(200).json({
    success: true,
    message:
      "Your reviews retrieved successfully",
    data: {
      reviews: result,
    },
  });
};

const deleteReview = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const reviewId = getRouteParameter(
    request,
    "reviewId",
  );

  await reviewServices.deleteReview(
    reviewId,
    user,
  );

  response.status(200).json({
    success: true,
    message: "Review deleted successfully",
    data: null,
  });
};

export const reviewControllers = {
  createReview,
  getCourseReviews,
  getMyReviews,
  deleteReview,
};