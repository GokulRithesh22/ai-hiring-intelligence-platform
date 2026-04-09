import { Router } from "express";

import { publicJobsController } from "./public-jobs.controller";

export const publicJobsRouter = Router();

publicJobsRouter.get("/", publicJobsController.listJobs);
publicJobsRouter.get("/:jobId", publicJobsController.getJob);
publicJobsRouter.post("/:jobId/apply", publicJobsController.apply);
