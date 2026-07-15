import { Types } from "mongoose";
import type { UserRole } from "../user/user.interface.js";
import { Course } from "../course/course.model.js";
import { Review } from "../review/review.model.js";

interface DashboardRequester {
  userId: string;
  role: UserRole;
}

interface CategoryAggregation {
  _id: string;
  total: number;
}

interface PriceRangeAggregation {
  _id: string;
  total: number;
}

interface RatingAggregation {
  _id: number;
  total: number;
}

const getDashboardStatistics = async (
  requester: DashboardRequester,
) => {
  const courseFilter =
    requester.role === "admin"
      ? {}
      : {
          createdBy: new Types.ObjectId(
            requester.userId,
          ),
        };

  const [
    totalCourses,
    averagePriceResult,
    categoryResult,
    priceRangeResult,
    ratingResult,
    recentCourses,
  ] = await Promise.all([
    Course.countDocuments(courseFilter),

    Course.aggregate<{
      _id: null;
      averagePrice: number;
    }>([
      {
        $match: courseFilter,
      },
      {
        $group: {
          _id: null,
          averagePrice: {
            $avg: "$price",
          },
        },
      },
    ]),

    Course.aggregate<CategoryAggregation>([
      {
        $match: courseFilter,
      },
      {
        $group: {
          _id: "$category",
          total: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
    ]),

    Course.aggregate<PriceRangeAggregation>([
      {
        $match: courseFilter,
      },
      {
        $bucket: {
          groupBy: "$price",
          boundaries: [
            0,
            1000,
            2000,
            3000,
            5000,
            1000000,
          ],
          default: "Other",
          output: {
            total: {
              $sum: 1,
            },
          },
        },
      },
    ]),

    Course.aggregate<RatingAggregation>([
      {
        $match: courseFilter,
      },
      {
        $bucket: {
          groupBy: "$rating",
          boundaries: [
            0,
            1,
            2,
            3,
            4,
            5.1,
          ],
          default: -1,
          output: {
            total: {
              $sum: 1,
            },
          },
        },
      },
    ]),

    Course.find(courseFilter)
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .select(
        "title category price rating createdAt",
      )
      .lean(),
  ]);

  const courseIds = await Course.find(
    courseFilter,
  ).distinct("_id");

  const totalReviews =
    courseIds.length > 0
      ? await Review.countDocuments({
          course: {
            $in: courseIds,
          },
        })
      : 0;

  const averagePrice =
    averagePriceResult.length > 0
      ? Number(
          (
            averagePriceResult[0]
              ?.averagePrice ?? 0
          ).toFixed(2),
        )
      : 0;

  const categoryData = categoryResult.map(
    (item) => ({
      category: item._id,
      total: item.total,
    }),
  );

  const priceLabels: Record<string, string> = {
    "0": "৳0–৳999",
    "1000": "৳1000–৳1999",
    "2000": "৳2000–৳2999",
    "3000": "৳3000–৳4999",
    "5000": "৳5000+",
    Other: "Other",
  };

  const priceData = priceRangeResult.map(
    (item) => ({
      range:
        priceLabels[String(item._id)] ??
        String(item._id),
      total: item.total,
    }),
  );

  const ratingData = ratingResult
    .filter((item) => item._id !== -1)
    .map((item) => ({
      rating: `${item._id}–${item._id + 0.9}`,
      total: item.total,
    }));

  return {
    summary: {
      totalCourses,
      totalReviews,
      averagePrice,
    },
    categoryData,
    priceData,
    ratingData,
    recentCourses,
  };
};

export const dashboardServices = {
  getDashboardStatistics,
};