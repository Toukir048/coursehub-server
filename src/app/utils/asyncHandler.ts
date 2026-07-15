import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import type { ParamsDictionary } from "express-serve-static-core";

type AsyncRouteHandler<RequestBody = unknown> = (
  request: Request<
    ParamsDictionary,
    unknown,
    RequestBody
  >,
  response: Response,
  next: NextFunction,
) => Promise<void>;

export const asyncHandler = <RequestBody = unknown>(
  handler: AsyncRouteHandler<RequestBody>,
): RequestHandler<
  ParamsDictionary,
  unknown,
  RequestBody
> => {
  return (request, response, next) => {
    void handler(request, response, next).catch(next);
  };
};