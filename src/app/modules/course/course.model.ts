import {
  model,
  Schema,
  type HydratedDocument,
} from "mongoose";
import type { ICourse } from "./course.interface.js";

const defaultCourseImage =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80";

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [
        5,
        "Course title must contain at least 5 characters",
      ],
      maxlength: [
        120,
        "Course title cannot exceed 120 characters",
      ],
    },

    shortDescription: {
      type: String,
      required: [
        true,
        "Course short description is required",
      ],
      trim: true,
      minlength: [
        20,
        "Short description must contain at least 20 characters",
      ],
      maxlength: [
        250,
        "Short description cannot exceed 250 characters",
      ],
    },

    fullDescription: {
      type: String,
      required: [
        true,
        "Course full description is required",
      ],
      trim: true,
      minlength: [
        50,
        "Full description must contain at least 50 characters",
      ],
      maxlength: [
        5000,
        "Full description cannot exceed 5000 characters",
      ],
    },

    category: {
      type: String,
      required: [true, "Course category is required"],
      trim: true,
      maxlength: [
        50,
        "Category cannot exceed 50 characters",
      ],
    },

    level: {
      type: String,
      required: [true, "Course level is required"],
      enum: {
        values: [
          "Beginner",
          "Intermediate",
          "Advanced",
        ],
        message: "{VALUE} is not a valid course level",
      },
    },

    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Course price cannot be negative"],
    },

    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be greater than 5"],
    },

    duration: {
      type: String,
      required: [true, "Course duration is required"],
      trim: true,
      maxlength: [
        50,
        "Duration cannot exceed 50 characters",
      ],
    },

    image: {
      type: String,
      trim: true,
      default: defaultCourseImage,
    },

    additionalImages: {
      type: [String],
      default: [],
    },

    instructorName: {
      type: String,
      required: [true, "Instructor name is required"],
      trim: true,
    },

    totalStudents: {
      type: Number,
      default: 0,
      min: [
        0,
        "Total students cannot be a negative number",
      ],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Course creator is required"],
      immutable: true,
    },

    learningOutcomes: {
      type: [String],
      default: [],
    },

    requirements: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

courseSchema.index({ createdBy: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ rating: -1 });

export type CourseDocument =
  HydratedDocument<ICourse>;

export const Course = model<ICourse>(
  "Course",
  courseSchema,
);