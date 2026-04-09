import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { ApiError } from "../lib/http";

export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      error: error.message,
      details: error.details ?? null
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: "Validation failed",
      details: error.flatten()
    });
    return;
  }

  response.status(500).json({
    error: "Internal server error"
  });
}
