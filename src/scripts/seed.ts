import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../app/config/database.js";
import { Course } from "../app/modules/course/course.model.js";
import { User, type UserDocument } from "../app/modules/user/user.model.js";

interface SeedAccount {
  email: string;
  password: string;
  name: string;
  role: "user" | "admin";
}

const getAccount = (
  emailVariable: string,
  passwordVariable: string,
  name: string,
  role: SeedAccount["role"],
): SeedAccount | null => {
  const email = process.env[emailVariable]?.trim().toLowerCase();
  const password = process.env[passwordVariable];

  if (!email || !password) {
    return null;
  }

  return { email, password, name, role };
};

const ensureUser = async (account: SeedAccount): Promise<UserDocument> => {
  const existingUser = await User.findOne({ email: account.email });

  if (existingUser) {
    return existingUser;
  }

  return User.create(account);
};

const demoCourses = [
  {
    title: "Practical TypeScript Foundations",
    shortDescription: "Build safer JavaScript applications with practical TypeScript patterns.",
    fullDescription: "Learn TypeScript fundamentals through realistic exercises covering strict types, interfaces, generics, narrowing, and maintainable application structure.",
    category: "Web Development",
    level: "Beginner" as const,
    price: 1200,
    duration: "6 weeks",
    learningOutcomes: ["Model application data safely", "Use strict TypeScript effectively"],
    requirements: ["Basic JavaScript knowledge"],
  },
  {
    title: "Express and MongoDB API Design",
    shortDescription: "Create secure, maintainable REST APIs using Express, Mongoose, and MongoDB.",
    fullDescription: "Develop a production-minded API with validation, authentication, authorization, pagination, consistent errors, and MongoDB data modeling.",
    category: "Backend Development",
    level: "Intermediate" as const,
    price: 2400,
    duration: "8 weeks",
    learningOutcomes: ["Design REST endpoints", "Protect resources with JWT authentication"],
    requirements: ["Node.js fundamentals", "Basic database knowledge"],
  },
  {
    title: "Advanced React Application Architecture",
    shortDescription: "Structure scalable React applications with reusable components and reliable state.",
    fullDescription: "Explore component boundaries, routing, server communication, authentication state, accessibility, performance, and resilient user-interface patterns.",
    category: "Frontend Development",
    level: "Advanced" as const,
    price: 3600,
    duration: "10 weeks",
    learningOutcomes: ["Plan scalable React features", "Build resilient asynchronous interfaces"],
    requirements: ["Comfort with React and TypeScript"],
  },
];

const runSeed = async (): Promise<void> => {
  const demoUser = getAccount(
    "DEMO_USER_EMAIL",
    "DEMO_USER_PASSWORD",
    "CourseHub Demo User",
    "user",
  );

  if (!demoUser) {
    console.log(
      "Seed skipped. Set DEMO_USER_EMAIL and DEMO_USER_PASSWORD, then run npm run seed again.",
    );
    return;
  }

  await connectDatabase();

  try {
    const user = await ensureUser(demoUser);
    const admin = getAccount(
      "DEMO_ADMIN_EMAIL",
      "DEMO_ADMIN_PASSWORD",
      "CourseHub Demo Admin",
      "admin",
    );

    if (admin) {
      await ensureUser(admin);
    }

    for (const course of demoCourses) {
      await Course.updateOne(
        { title: course.title, createdBy: user._id },
        {
          $setOnInsert: {
            ...course,
            createdBy: user._id,
            instructorName: user.name,
            rating: 0,
            totalStudents: 0,
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80",
            additionalImages: [],
          },
        },
        { upsert: true },
      );
    }

    console.log("CourseHub demo data is ready.");
  } finally {
    await disconnectDatabase();
  }
};

runSeed().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Seed failed unexpectedly");
  process.exitCode = 1;
});
