import type { ZodSchema } from "zod";

import { ApiError } from "./http";

export function parsePayload<T>(schema: ZodSchema<T>, payload: unknown): T {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new ApiError(400, "Validation failed", result.error.flatten());
  }

  return result.data;
}

export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "number" ? value : Number(value);
}

export function getRouteParam(
  value: string | string[] | undefined,
  name: string
): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (Array.isArray(value) && value[0]) {
    return value[0];
  }

  throw new ApiError(400, `Missing route parameter: ${name}`);
}
