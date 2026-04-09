import { Router } from "express";

import { requireAuth } from "../../middleware/auth";
import { authController } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/demo-session", authController.createDemoSession);
authRouter.get("/me", requireAuth, authController.getCurrentUser);
