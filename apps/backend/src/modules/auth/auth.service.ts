import type { CreateDemoSessionInput, User } from "@ai-hiring/shared-types";

import { ApiError } from "../../lib/http";
import { authRepository } from "./auth.repository";

export class AuthService {
  async createDemoSession(input: CreateDemoSessionInput) {
    const user = await authRepository.upsertDemoUser(input);

    return {
      user,
      demoToken: `demo-user:${user.id}:${user.role}`,
      authHeaders: {
        Authorization: `Bearer demo-user:${user.id}:${user.role}`,
        "x-demo-user-id": user.id,
        "x-demo-role": user.role
      }
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    return authRepository.findById(userId);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return authRepository.findByEmail(email);
  }

  async syncSupabaseUser(input: {
    email: string;
    fullName: string;
    role: User["role"];
  }): Promise<User> {
    return authRepository.upsertSupabaseUser(input);
  }

  requireUser(user: User | null): User {
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    return user;
  }
}

export const authService = new AuthService();
