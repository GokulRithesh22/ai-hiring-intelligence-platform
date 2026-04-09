import type { NextFunction, Request, Response } from "express";

import type { User, UserRole } from "@ai-hiring/shared-types";

import { ApiError } from "../lib/http";
import { authService } from "../modules/auth/auth.service";

declare global {
  namespace Express {
    interface Request {
      user: User | null;
    }
  }
}

function extractDemoToken(request: Request): { userId: string; role?: UserRole } | null {
  const authHeader = request.header("authorization");
  const demoUserId = request.header("x-demo-user-id");
  const demoRole = request.header("x-demo-role") as UserRole | undefined;

  if (demoUserId) {
    return { userId: demoUserId, role: demoRole };
  }

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const [prefix, userId, role] = token.split(":");

  if (prefix !== "demo-user" || !userId) {
    return null;
  }

  return { userId, role: role as UserRole | undefined };
}

export async function attachDemoUser(request: Request, _response: Response, next: NextFunction) {
  const token = extractDemoToken(request);

  if (!token) {
    request.user = null;
    next();
    return;
  }

  try {
    const user = await authService.getUserById(token.userId);
    request.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuth(request: Request, _response: Response, next: NextFunction): void {
  if (!request.user) {
    next(new ApiError(401, "Authentication required"));
    return;
  }

  next();
}

export function requireRole(...roles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    if (!roles.includes(request.user.role)) {
      next(new ApiError(403, "You do not have access to this resource"));
      return;
    }

    next();
  };
}
