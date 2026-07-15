import type { Request, Response } from "express";
import { AppError } from "../../errors/AppError.js";
import type {
  CourseQuery,
  CreateCoursePayload,
  UpdateCoursePayload,
} from "./course.interface.js";
import { courseServices } from "./course.service.js";

const getAuthenticatedUser = (request: Request) => {
  if (!request.user) {
    throw new AppError(
      401,
      "Authentication information is missing",
    );
  }

  return request.user;
};

const getCourseId = (request: Request): string => {
  const courseId = request.params.courseId;

  if (typeof courseId !== "string") {
    throw new AppError(
      400,
      "Course identifier is required",
    );
  }

  return courseId;
};

const createCourse = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const result = await courseServices.createCourse(
    request.body as CreateCoursePayload,
    user.userId,
  );

  response.status(201).json({
    success: true,
    message: "Course created successfully",
    data: {
      course: result,
    },
  });
};

const getCourses = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await courseServices.getCourses(
    request.query as unknown as CourseQuery,
  );

  response.status(200).json({
    success: true,
    message: "Courses retrieved successfully",
    data: result,
  });
};

const getCourseById = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const courseId = getCourseId(request);

  const result =
    await courseServices.getCourseById(courseId);

  response.status(200).json({
    success: true,
    message: "Course retrieved successfully",
    data: {
      course: result,
    },
  });
};

const getMyCourses = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const result =
    await courseServices.getMyCourses(user.userId);

  response.status(200).json({
    success: true,
    message:
      "Your courses retrieved successfully",
    data: {
      courses: result,
    },
  });
};

const updateCourse = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const courseId = getCourseId(request);

  const result = await courseServices.updateCourse(
    courseId,
    request.body as UpdateCoursePayload,
    user,
  );

  response.status(200).json({
    success: true,
    message: "Course updated successfully",
    data: {
      course: result,
    },
  });
};

const deleteCourse = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const courseId = getCourseId(request);

  await courseServices.deleteCourse(
    courseId,
    user,
  );

  response.status(200).json({
    success: true,
    message: "Course deleted successfully",
    data: null,
  });
};

export const courseControllers = {
  createCourse,
  getCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  deleteCourse,
};