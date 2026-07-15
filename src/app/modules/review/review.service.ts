import {
  isValidObjectId,
  Types,
} from "mongoose";
import { AppError } from "../../errors/AppError.js";
import type { UserRole } from "../user/user.interface.js";
import { User } from "../user/user.model.js";
import { Course } from "../course/course.model.js";
import type {
  CreateReviewPayload,
  IReview,
} from "./review.interface.js";
import {
  Review,
  type ReviewDocument,
} from "./review.model.js";

interface AuthenticatedRequester {
  userId: string;
  role: UserRole;
}

interface RatingAggregationResult {
  _id: null;
  averageRating: number;
}

const validateObjectId = (
  id: string,
  entityName: string,
): void => {
  if (!isValidObjectId(id)) {
    throw new AppError(
      400,
      `Invalid ${entityName} identifier`,
    );
  }
};

const updateCourseAverageRating = async (
  courseId: string,
): Promise<void> => {
  const result =
    await Review.aggregate<RatingAggregationResult>([
      {
        $match: {
          course: new Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);

  const averageRating =
    result.length > 0
      ? Number(result[0]?.averageRating.toFixed(1))
      : 0;

  await Course.findByIdAndUpdate(courseId, {
    rating: averageRating,
  });
};

const createReview = async (
  payload: CreateReviewPayload,
  userId: string,
): Promise<ReviewDocument> => {
  validateObjectId(
    payload.courseId,
    "course",
  );

  const rating = Number(payload.rating);

  if (
    Number.isNaN(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw new AppError(
      400,
      "Rating must be between 1 and 5",
    );
  }

  const comment = payload.comment?.trim();

  if (!comment) {
    throw new AppError(
      400,
      "Review comment is required",
    );
  }

  const [course, user] = await Promise.all([
    Course.findById(payload.courseId),
    User.findById(userId),
  ]);

  if (!course) {
    throw new AppError(404, "Course not found");
  }

  if (!user) {
    throw new AppError(
      404,
      "User account not found",
    );
  }

  const existingReview = await Review.findOne({
    course: payload.courseId,
    user: userId,
  });

  if (existingReview) {
    throw new AppError(
      409,
      "You have already reviewed this course",
    );
  }

  const review = await Review.create({
    course: course._id,
    user: user._id,
    userName: user.name,
    userImage: user.image,
    rating,
    comment,
  });

  await updateCourseAverageRating(
    payload.courseId,
  );

  return review;
};

const getCourseReviews = async (
  courseId: string,
): Promise<IReview[]> => {
  validateObjectId(courseId, "course");

  const courseExists =
    await Course.exists({
      _id: courseId,
    });

  if (!courseExists) {
    throw new AppError(404, "Course not found");
  }

  return Review.find({
    course: courseId,
  })
    .sort({
      createdAt: -1,
    })
    .lean();
};

const getMyReviews = async (
  userId: string,
): Promise<IReview[]> => {
  return Review.find({
    user: userId,
  })
    .sort({
      createdAt: -1,
    })
    .lean();
};

const deleteReview = async (
  reviewId: string,
  requester: AuthenticatedRequester,
): Promise<void> => {
  validateObjectId(reviewId, "review");

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new AppError(404, "Review not found");
  }

  const isOwner =
    review.user.toString() === requester.userId;

  const isAdmin =
    requester.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError(
      403,
      "You can only delete your own review",
    );
  }

  const courseId =
    review.course.toString();

  await review.deleteOne();

  await updateCourseAverageRating(courseId);
};

export const reviewServices = {
  createReview,
  getCourseReviews,
  getMyReviews,
  deleteReview,
};