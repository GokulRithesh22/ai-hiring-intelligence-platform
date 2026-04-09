import { Router } from "express";

import { healthController } from "./health.controller";

export const healthRouter = Router();

healthRouter.get("/", healthController.getHealth);
healthRouter.get("/live", healthController.getLive);
healthRouter.get("/ready", healthController.getReady);
