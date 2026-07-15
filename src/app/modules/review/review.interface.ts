import type { Types } from "mongoose";

export interface IReview {
  course: Types.ObjectId;
  user: Types.ObjectId;
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewPayload {
  courseId: string;
  rating: number;
  comment: string;
}