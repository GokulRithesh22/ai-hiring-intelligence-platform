import { z } from "zod";

import { asyncHandler } from "../../lib/http";
import { parsePayload } from "../../lib/validation";
import { authService } from "./auth.service";

const createDemoSessionSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  role: z.enum(["MANAGER", "HR", "RECRUITER", "ADMIN"])
});

export const authController = {
  createDemoSession: asyncHandler(async (request, response) => {
    const payload = parsePayload(createDemoSessionSchema, request.body);
    const session = await authService.createDemoSession(payload);

    response.status(201).json(session);
  }),

  getCurrentUser: asyncHandler(async (request, response) => {
    response.json({
      user: request.user
    });
  })
};
