import {
  isValidObjectId,
  type QueryFilter,
} from "mongoose";
import { AppError } from "../../errors/AppError.js";
import type { UserRole } from "../user/user.interface.js";
import { User } from "../user/user.model.js";
import type {
  CourseListResult,
  CourseQuery,
  CreateCoursePayload,
  ICourse,
  UpdateCoursePayload,
} from "./course.interface.js";
import {
  Course,
  type CourseDocument,
} from "./course.model.js";

const defaultCourseImage =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80";

interface AuthenticatedRequester {
  userId: string;
  role: UserRole;
}

const escapeRegularExpression = (
  value: string,
): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const sanitizeStringArray = (
  values: unknown,
): string[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .filter(
      (value): value is string =>
        typeof value === "string",
    )
    .map((value) => value.trim())
    .filter(Boolean);
};

const parsePositiveInteger = (
  value: string | undefined,
  defaultValue: number,
): number => {
  const parsedValue = Number(value);

  if (
    !value ||
    Number.isNaN(parsedValue) ||
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0
  ) {
    return defaultValue;
  }

  return parsedValue;
};

const validateCourseId = (
  courseId: string,
): void => {
  if (!isValidObjectId(courseId)) {
    throw new AppError(
      400,
      "Invalid course identifier",
    );
  }
};

const findCourseById = async (
  courseId: string,
): Promise<CourseDocument> => {
  validateCourseId(courseId);

  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError(404, "Course not found");
  }

  return course;
};

const checkCourseOwnership = (
  course: CourseDocument,
  requester: AuthenticatedRequester,
): void => {
  const isOwner =
    course.createdBy.toString() === requester.userId;

  const isAdmin = requester.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError(
      403,
      "You can only manage courses created by your account",
    );
  }
};

const createCourse = async (
  payload: CreateCoursePayload,
  userId: string,
): Promise<CourseDocument> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(
      404,
      "User account not found",
    );
  }

  const price = Number(payload.price);

  if (Number.isNaN(price) || price < 0) {
    throw new AppError(
      400,
      "Course price must be a valid non-negative number",
    );
  }

  const course = await Course.create({
    title: payload.title?.trim(),
    shortDescription:
      payload.shortDescription?.trim(),
    fullDescription:
      payload.fullDescription?.trim(),
    category: payload.category?.trim(),
    level: payload.level,
    price,
    duration: payload.duration?.trim(),
    image:
      payload.image?.trim() || defaultCourseImage,
    additionalImages: sanitizeStringArray(
      payload.additionalImages,
    ),
    instructorName: user.name,
    totalStudents: 0,
    rating: 0,
    createdBy: user._id,
    learningOutcomes: sanitizeStringArray(
      payload.learningOutcomes,
    ),
    requirements: sanitizeStringArray(
      payload.requirements,
    ),
  });

  return course;
};

const getCourses = async (
  query: CourseQuery,
): Promise<CourseListResult> => {
  const filter: QueryFilter<ICourse> = {};

  const search = query.search?.trim();

  if (search) {
    const safeSearch =
      escapeRegularExpression(search);

    filter.$or = [
      {
        title: {
          $regex: safeSearch,
          $options: "i",
        },
      },
      {
        shortDescription: {
          $regex: safeSearch,
          $options: "i",
        },
      },
      {
        instructorName: {
          $regex: safeSearch,
          $options: "i",
        },
      },
    ];
  }

  const category = query.category?.trim();

  if (category && category !== "all") {
    filter.category = category;
  }

  if (
    query.maxPrice &&
    query.maxPrice !== "all"
  ) {
    const maximumPrice = Number(query.maxPrice);

    if (!Number.isNaN(maximumPrice)) {
      filter.price = {
        $lte: maximumPrice,
      };
    }
  }

  if (
    query.minimumRating &&
    query.minimumRating !== "all"
  ) {
    const minimumRating = Number(
      query.minimumRating,
    );

    if (!Number.isNaN(minimumRating)) {
      filter.rating = {
        $gte: minimumRating,
      };
    }
  }

  const page = parsePositiveInteger(
    query.page,
    1,
  );

  const requestedLimit = parsePositiveInteger(
    query.limit,
    8,
  );

  const limit = Math.min(
    requestedLimit,
    50,
  );

  let sortOption: Record<string, 1 | -1> = {
    createdAt: -1,
  };

  if (query.sort === "price-low") {
    sortOption = {
      price: 1,
    };
  } else if (query.sort === "price-high") {
    sortOption = {
      price: -1,
    };
  } else if (query.sort === "rating") {
    sortOption = {
      rating: -1,
    };
  }

  const skip = (page - 1) * limit;

  const [courses, totalItems] =
    await Promise.all([
      Course.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),

      Course.countDocuments(filter),
    ]);

  const totalPages = Math.ceil(
    totalItems / limit,
  );

  return {
    courses,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
};

const getCourseById = async (
  courseId: string,
): Promise<CourseDocument> => {
  return findCourseById(courseId);
};

const getMyCourses = async (
  userId: string,
): Promise<CourseDocument[]> => {
  return Course.find({
    createdBy: userId,
  }).sort({
    createdAt: -1,
  });
};

const updateCourse = async (
  courseId: string,
  payload: UpdateCoursePayload,
  requester: AuthenticatedRequester,
): Promise<CourseDocument> => {
  const course = await findCourseById(courseId);

  checkCourseOwnership(course, requester);

  const updateData: UpdateCoursePayload = {};

  if (payload.title !== undefined) {
    updateData.title = payload.title.trim();
  }

  if (
    payload.shortDescription !== undefined
  ) {
    updateData.shortDescription =
      payload.shortDescription.trim();
  }

  if (
    payload.fullDescription !== undefined
  ) {
    updateData.fullDescription =
      payload.fullDescription.trim();
  }

  if (payload.category !== undefined) {
    updateData.category =
      payload.category.trim();
  }

  if (payload.level !== undefined) {
    updateData.level = payload.level;
  }

  if (payload.price !== undefined) {
    const price = Number(payload.price);

    if (Number.isNaN(price) || price < 0) {
      throw new AppError(
        400,
        "Course price must be a valid non-negative number",
      );
    }

    updateData.price = price;
  }

  if (payload.duration !== undefined) {
    updateData.duration =
      payload.duration.trim();
  }

  if (payload.image !== undefined) {
    updateData.image =
      payload.image.trim() ||
      defaultCourseImage;
  }

  if (
    payload.additionalImages !== undefined
  ) {
    updateData.additionalImages =
      sanitizeStringArray(
        payload.additionalImages,
      );
  }

  if (
    payload.learningOutcomes !== undefined
  ) {
    updateData.learningOutcomes =
      sanitizeStringArray(
        payload.learningOutcomes,
      );
  }

  if (
    payload.requirements !== undefined
  ) {
    updateData.requirements =
      sanitizeStringArray(
        payload.requirements,
      );
  }

  if (
    Object.keys(updateData).length === 0
  ) {
    throw new AppError(
      400,
      "Provide at least one valid field to update",
    );
  }

  course.set(updateData);

  await course.save();

  return course;
};

const deleteCourse = async (
  courseId: string,
  requester: AuthenticatedRequester,
): Promise<void> => {
  const course = await findCourseById(courseId);

  checkCourseOwnership(course, requester);

  await course.deleteOne();
};

export const courseServices = {
  createCourse,
  getCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  deleteCourse,
};