import { Router } from "express";

import { requireAuth } from "../../middleware/auth";
import { emailEventsController } from "./email-events.controller";

export const emailEventsRouter = Router();

emailEventsRouter.get("/", requireAuth, emailEventsController.list);
