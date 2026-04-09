import { Router } from "express";

import { resumeUpload } from "../../lib/resume-upload";
import { publicJobsController } from "./public-jobs.controller";

export const publicJobsRouter = Router();

publicJobsRouter.get("/", publicJobsController.listJobs);
publicJobsRouter.get("/:jobId", publicJobsController.getJob);
publicJobsRouter.post("/:jobId/apply", resumeUpload.single("resume"), publicJobsController.apply);
