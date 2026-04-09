import type { NextFunction, Request, RequestHandler, Response } from "express";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function asyncHandler(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (request, response, next) => {
    void handler(request, response, next).catch(next);
  };
}
