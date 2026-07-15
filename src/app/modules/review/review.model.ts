import {
  model,
  Schema,
  type HydratedDocument,
} from "mongoose";
import type { IReview } from "./review.interface.js";

const reviewSchema = new Schema<IReview>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review user is required"],
    },

    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },

    userImage: {
      type: String,
      default: "",
      trim: true,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating cannot be less than 1"],
      max: [5, "Rating cannot be greater than 5"],
    },

    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [
        5,
        "Review comment must contain at least 5 characters",
      ],
      maxlength: [
        1000,
        "Review comment cannot exceed 1000 characters",
      ],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reviewSchema.index(
  {
    course: 1,
    user: 1,
  },
  {
    unique: true,
  },
);

reviewSchema.index({
  course: 1,
  createdAt: -1,
});

export type ReviewDocument =
  HydratedDocument<IReview>;

export const Review = model<IReview>(
  "Review",
  reviewSchema,
);