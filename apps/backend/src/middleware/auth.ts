import type { NextFunction, Request, Response } from "express";

import type { User, UserRole } from "@ai-hiring/shared-types";

import { env } from "../config/env";
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

type RoleInput = UserRole | Lowercase<UserRole>;

function normalizeRole(role: RoleInput): UserRole {
  return role.toUpperCase() as UserRole;
}

function parseSupabaseRole(role: unknown): UserRole {
  if (typeof role !== "string") {
    return "RECRUITER";
  }

  const normalized = role.toUpperCase();
  return normalized === "ADMIN" ? "ADMIN" : "RECRUITER";
}

function extractBearerToken(request: Request): string | null {
  const authHeader = request.header("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.replace("Bearer ", "");
}

async function verifySupabaseUser(accessToken: string): Promise<User | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return null;
  }

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    email?: string;
    user_metadata?: Record<string, unknown> | null;
    app_metadata?: Record<string, unknown> | null;
  };

  if (!payload.email) {
    return null;
  }

  const existingUser = await authService.getUserByEmail(payload.email);
  if (existingUser) {
    return existingUser;
  }

  const metadataRole =
    payload.app_metadata?.role ??
    payload.user_metadata?.role ??
    payload.app_metadata?.user_role ??
    payload.user_metadata?.user_role;
  const normalizedMetadataRole = parseSupabaseRole(metadataRole);

  return authService.syncSupabaseUser({
    email: payload.email,
    fullName:
      (payload.user_metadata?.full_name as string | undefined) ??
      (payload.user_metadata?.name as string | undefined) ??
      payload.email,
    role: normalizedMetadataRole
  });
}

export async function attachAuthenticatedUser(
  request: Request,
  _response: Response,
  next: NextFunction
) {
  const token = extractDemoToken(request);

  if (!token) {
    const accessToken = extractBearerToken(request);

    if (!accessToken) {
      request.user = null;
      next();
      return;
    }

    try {
      request.user = await verifySupabaseUser(accessToken);
      next();
      return;
    } catch (error) {
      next(error);
      return;
    }
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

export function requireRole(rolesOrRole: RoleInput[] | RoleInput, ...remainingRoles: RoleInput[]) {
  const roles = (Array.isArray(rolesOrRole) ? rolesOrRole : [rolesOrRole, ...remainingRoles]).map(
    normalizeRole
  );

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

export const requireRecruiterRole = requireRole(["RECRUITER", "ADMIN"]);
export const requireHrRole = requireRecruiterRole;
