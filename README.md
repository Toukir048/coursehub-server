# CourseHub API

The CourseHub API is a TypeScript REST service for authentication, course management, reviews, ratings, and dashboard analytics.

## Main features

- Password hashing, JWT authentication, and role authorization
- Paginated course CRUD with owner/admin protection
- One review per user/course and calculated average ratings
- User-scoped and administrator-wide dashboard statistics
- Validated environment configuration, restricted CORS, and consistent errors
- Production-safe health endpoint and optional idempotent demo seed

## Technologies

Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcrypt, cors, and dotenv.

## Structure

`src/server.ts` starts the service, `src/app.ts` configures middleware/routes, `src/app/config` handles configuration, `src/app/middlewares` contains request middleware, `src/app/modules` contains domain modules, and `src/scripts` contains manual scripts.

## Environment variables

Copy `.env.example` to `.env`. Required values are `CLIENT_URL`, `DATABASE_URL`, and a `JWT_SECRET` of at least 32 characters. `NODE_ENV`, `PORT`, `JWT_EXPIRES_IN`, and `BCRYPT_SALT_ROUNDS` control runtime behavior. `CLIENT_URL` accepts comma-separated HTTP(S) origins. Seed-only demo credentials are optional and documented in `.env.example`.

## Local setup

```bash
npm install
copy .env.example .env
npm run dev
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the development watcher |
| `npm run type-check` | Check strict TypeScript types |
| `npm run build` | Compile into `dist` |
| `npm start` | Run the compiled server |
| `npm run seed` | Manually seed configured demo accounts/courses |

API base path: `/api/v1`

## Authentication and permissions

Register/login return an access token. Send it on protected requests:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Users manage their own courses and reviews. Administrators may manage any course/review and view platform-wide dashboard data.

## Endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| GET | `/api/v1/auth/me` | Authenticated |
| GET | `/api/v1/auth/admin-check` | Admin |
| GET | `/api/v1/courses` | Public |
| GET | `/api/v1/courses/:courseId` | Public |
| GET | `/api/v1/courses/mine` | Authenticated |
| POST | `/api/v1/courses` | Authenticated |
| PATCH | `/api/v1/courses/:courseId` | Owner/admin |
| DELETE | `/api/v1/courses/:courseId` | Owner/admin |
| POST | `/api/v1/reviews` | Authenticated |
| GET | `/api/v1/reviews/course/:courseId` | Public |
| GET | `/api/v1/reviews/mine` | Authenticated |
| DELETE | `/api/v1/reviews/:reviewId` | Owner/admin |
| GET | `/api/v1/dashboard/statistics` | Authenticated |
| GET | `/api/v1/health` | Public |

## Seed data

Set both `DEMO_USER_EMAIL` and `DEMO_USER_PASSWORD`, then run `npm run seed`. Optional admin creation requires both admin variables. The script does not delete data and avoids duplicate demo courses.

## Deployment and security

Configure environment variables in the hosting provider, build with `npm run build`, and start with `npm start`. Never commit `.env`, credentials, tokens, or database connection strings. Use HTTPS, a strong unique JWT secret, restricted production origins, and managed database network controls.

Frontend repository: `YOUR_FRONTEND_REPOSITORY_URL`

Live backend: `YOUR_BACKEND_LIVE_URL`

## Author

MD Toukir Sarder — [GitHub](https://github.com/Toukir048)
