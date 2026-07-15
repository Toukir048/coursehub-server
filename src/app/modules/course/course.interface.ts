import type { Types } from "mongoose";

export type CourseLevel =
  | "Beginner"
  | "Intermediate"
  | "Advanced";

export type CourseSortOption =
  | "newest"
  | "price-low"
  | "price-high"
  | "rating";

export interface ICourse {
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  level: CourseLevel;
  price: number;
  rating: number;
  duration: string;
  image: string;
  additionalImages: string[];
  instructorName: string;
  totalStudents: number;
  createdBy: Types.ObjectId;
  learningOutcomes: string[];
  requirements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCoursePayload {
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  level: CourseLevel;
  price: number;
  duration: string;
  image?: string;
  additionalImages?: string[];
  learningOutcomes?: string[];
  requirements?: string[];
}

export type UpdateCoursePayload =
  Partial<CreateCoursePayload>;

export interface CourseQuery {
  search?: string;
  category?: string;
  maxPrice?: string;
  minimumRating?: string;
  sort?: CourseSortOption;
  page?: string;
  limit?: string;
}

export interface CoursePagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface CourseListResult {
  courses: ICourse[];
  pagination: CoursePagination;
}